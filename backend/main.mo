import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Int "mo:core/Int";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Iter "mo:core/Iter";

actor {
  type Priority = {
    #High;
    #Medium;
    #Low;
  };

  type Status = {
    #InProgress;
    #Completed;
    #Pending;
    #CarryForward;
  };

  type Role = {
    #Admin;
    #TeamMember;
  };

  type Task = {
    id : Nat;
    title : Text;
    conferenceName : ?Text;
    description : ?Text;
    assignedTo : Text;
    deadline : Int;
    priority : Priority;
    status : Status;
    createdAt : Int;
  };

  type User = {
    id : Nat;
    name : Text;
    email : Text;
    passwordHash : Text;
    role : Role;
    createdAt : Int;
  };

  type ActivityEntry = {
    id : Nat;
    actorName : Text;
    actorEmail : Text;
    actionType : {
      #TaskCreated;
      #TaskEdited;
      #TaskDeleted;
      #StatusChanged;
      #Login;
    };
    taskId : Nat;
    taskTitle : Text;
    description : Text;
    timestamp : Int;
  };

  type UserProfile = {
    name : Text;
    email : Text;
    role : Role;
  };

  type TeamMember = {
    name : Text;
    email : Text;
    role : Role;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var nextTaskId : Nat = 1;
  var nextUserId : Nat = 1;
  var nextActivityId : Nat = 1;

  let teamMembers = Map.empty<Nat, TeamMember>();
  var nextTeamMemberId : Nat = 1;

  let tasks = Map.empty<Nat, Task>();
  let users = Map.empty<Text, User>();
  let activityLog = Map.empty<Nat, ActivityEntry>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let passwordResetTokens = Map.empty<Text, (Text, Int)>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // registerUser is open to anyone (guests can register)
  public shared ({ caller }) func registerUser(
    name : Text,
    email : Text,
    password : Text,
  ) : async User {
    switch (users.get(email)) {
      case (?_) { Runtime.trap("Email already registered") };
      case (null) {};
    };

    let newUser : User = {
      id = nextUserId;
      name;
      email;
      passwordHash = password;
      role = #TeamMember;
      createdAt = Time.now();
    };

    users.add(email, newUser);
    userProfiles.add(caller, { name; email; role = #TeamMember });
    nextUserId += 1;
    newUser;
  };

  // loginUser is open to anyone (guests can log in)
  public shared ({ caller }) func loginUser(email : Text, password : Text) : async User {
    switch (users.get(email)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        if (Text.equal(user.passwordHash, password)) {
          logLoginEvent(user.name, email);
          return user;
        } else {
          Runtime.trap("Incorrect password");
        };
      };
    };
  };

  // requestPasswordReset is open to anyone
  public shared ({ caller }) func requestPasswordReset(email : Text) : async Text {
    if (not users.containsKey(email)) {
      Runtime.trap("No account found with that email");
    };
    let token = email # Time.now().toText();
    let expiry = Time.now() + 3_600_000_000_000;
    passwordResetTokens.add(token, (email, expiry));
    token;
  };

  // resetPassword is open to anyone (token-based)
  public shared ({ caller }) func resetPassword(token : Text, newPassword : Text) : async () {
    switch (passwordResetTokens.get(token)) {
      case (null) {
        Runtime.trap("Invalid or expired reset token");
      };
      case (?(email, expiry)) {
        if (Time.now() > expiry) {
          passwordResetTokens.remove(token);
          Runtime.trap("Reset token has expired");
        };
        switch (users.get(email)) {
          case (null) { Runtime.trap("User not found") };
          case (?user) {
            let updatedUser : User = {
              id = user.id;
              name = user.name;
              email = user.email;
              passwordHash = newPassword;
              role = user.role;
              createdAt = user.createdAt;
            };
            users.add(email, updatedUser);
            passwordResetTokens.remove(token);
          };
        };
      };
    };
  };

  // addUser is admin-only
  public shared ({ caller }) func addUser(
    name : Text,
    email : Text,
    password : Text,
    role : Role,
  ) : async User {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add users");
    };
    switch (users.get(email)) {
      case (?_) { Runtime.trap("Email already registered") };
      case (null) {};
    };

    let newUser : User = {
      id = nextUserId;
      name;
      email;
      passwordHash = password;
      role;
      createdAt = Time.now();
    };

    users.add(email, newUser);
    nextUserId += 1;
    newUser;
  };

  // deleteUser is admin-only
  public shared ({ caller }) func deleteUser(userEmail : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete users");
    };
    if (not users.containsKey(userEmail)) {
      Runtime.trap("User not found");
    };
    users.remove(userEmail);
  };

  // createTask requires authenticated user
  public shared ({ caller }) func createTask(
    title : Text,
    conferenceName : ?Text,
    description : ?Text,
    assignedTo : Text,
    deadline : Int,
    priority : Priority,
  ) : async Task {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can create tasks");
    };
    let callerProfile = userProfiles.get(caller);
    let (actorName, actorEmail) = switch (callerProfile) {
      case (?p) { (p.name, p.email) };
      case null { ("Unknown", "unknown@domain.com") };
    };
    let task : Task = {
      id = nextTaskId;
      title;
      conferenceName;
      description;
      assignedTo;
      deadline;
      priority;
      status = #Pending;
      createdAt = Time.now();
    };
    tasks.add(nextTaskId, task);
    recordActivity(
      actorName,
      actorEmail,
      #TaskCreated,
      nextTaskId,
      title,
      "Task '" # title # "' created by " # actorName,
    );
    nextTaskId += 1;
    task;
  };

  // updateTaskStatus requires authenticated user
  public shared ({ caller }) func updateTaskStatus(taskId : Nat, newStatus : Status) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can update task status");
    };
    let callerProfile = userProfiles.get(caller);
    let (actorName, actorEmail) = switch (callerProfile) {
      case (?p) { (p.name, p.email) };
      case null { ("Unknown", "unknown@domain.com") };
    };
    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        let updatedTask : Task = {
          id = task.id;
          title = task.title;
          conferenceName = task.conferenceName;
          description = task.description;
          assignedTo = task.assignedTo;
          deadline = task.deadline;
          priority = task.priority;
          status = newStatus;
          createdAt = task.createdAt;
        };
        tasks.add(taskId, updatedTask);
        recordActivity(
          actorName,
          actorEmail,
          #StatusChanged,
          taskId,
          task.title,
          "Task '" # task.title # "' status changed by " # actorName,
        );
      };
    };
  };

  // deleteTask is admin-only
  public shared ({ caller }) func deleteTask(taskId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete tasks");
    };
    let callerProfile = userProfiles.get(caller);
    let (actorName, actorEmail) = switch (callerProfile) {
      case (?p) { (p.name, p.email) };
      case null { ("Admin", "admin@domain.com") };
    };
    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        tasks.remove(taskId);
        recordActivity(
          actorName,
          actorEmail,
          #TaskDeleted,
          taskId,
          task.title,
          "Task '" # task.title # "' deleted by " # actorName,
        );
      };
    };
  };

  // editTask requires authenticated user
  public shared ({ caller }) func editTask(
    taskId : Nat,
    title : Text,
    description : ?Text,
    assignedTo : Text,
    deadline : Int,
    priority : Priority,
    conferenceName : ?Text,
  ) : async Task {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can edit tasks");
    };
    let callerProfile = userProfiles.get(caller);
    let (actorName, actorEmail) = switch (callerProfile) {
      case (?p) { (p.name, p.email) };
      case null { ("Unknown", "unknown@domain.com") };
    };
    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?existingTask) {
        let updatedTask : Task = {
          id = taskId;
          title;
          conferenceName;
          description;
          assignedTo;
          deadline;
          priority;
          status = existingTask.status;
          createdAt = existingTask.createdAt;
        };
        tasks.add(taskId, updatedTask);
        recordActivity(
          actorName,
          actorEmail,
          #TaskEdited,
          taskId,
          title,
          "Task '" # title # "' edited by " # actorName,
        );
        updatedTask;
      };
    };
  };

  // getAllTasks requires authenticated user
  public query ({ caller }) func getAllTasks() : async [Task] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view tasks");
    };
    tasks.values().toArray();
  };

  // getTasksByAssignee requires authenticated user
  public query ({ caller }) func getTasksByAssignee(assignee : Text) : async [Task] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view tasks");
    };
    tasks.values().toArray().filter<Task>(
      func(task) { Text.equal(task.assignedTo, assignee) },
    );
  };

  // addTeamMember requires authenticated user (any authenticated caller may add a team member)
  public shared ({ caller }) func addTeamMember(name : Text, email : Text, role : Role) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can add team members");
    };
    for ((_, member) in teamMembers.entries()) {
      if (Text.equal(member.name, name)) {
        Runtime.trap("Team member already exists");
      };
    };
    let newMember : TeamMember = { name; email; role };
    teamMembers.add(nextTeamMemberId, newMember);
    nextTeamMemberId += 1;
  };

  // removeTeamMember is admin-only
  public shared ({ caller }) func removeTeamMember(name : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove team members");
    };
    var foundKey : ?Nat = null;
    for ((key, member) in teamMembers.entries()) {
      if (Text.equal(member.name, name)) {
        foundKey := ?key;
      };
    };
    switch (foundKey) {
      case (null) { Runtime.trap("Team member not found") };
      case (?key) { teamMembers.remove(key) };
    };
  };

  // getTeamMembers requires authenticated user
  public query ({ caller }) func getTeamMembers() : async [TeamMember] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view team members");
    };
    teamMembers.values().toArray();
  };

  func recordActivity(
    actorName : Text,
    actorEmail : Text,
    actionType : {
      #TaskCreated;
      #TaskEdited;
      #TaskDeleted;
      #StatusChanged;
      #Login;
    },
    taskId : Nat,
    taskTitle : Text,
    description : Text,
  ) {
    let entry : ActivityEntry = {
      id = nextActivityId;
      actorName;
      actorEmail;
      actionType;
      taskId;
      taskTitle;
      description;
      timestamp = Time.now();
    };
    activityLog.add(nextActivityId, entry);
    nextActivityId += 1;
  };

  func logLoginEvent(name : Text, email : Text) {
    let entry : ActivityEntry = {
      id = nextActivityId;
      actorName = name;
      actorEmail = email;
      actionType = #Login;
      taskId = 0;
      taskTitle = "";
      description = name # " logged in";
      timestamp = Time.now();
    };
    activityLog.add(nextActivityId, entry);
    nextActivityId += 1;
  };

  // getRecentLoginEvents is admin-only: login events are sensitive activity log data
  public query ({ caller }) func getRecentLoginEvents(fromTime : Int, toTime : Int) : async [ActivityEntry] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view login events");
    };
    activityLog.values().toArray().filter(
      func(entry : ActivityEntry) : Bool {
        entry.actionType == #Login and entry.timestamp >= fromTime and entry.timestamp <= toTime
      }
    );
  };

  // getAllActivityLogs is admin-only
  public query ({ caller }) func getAllActivityLogs() : async [ActivityEntry] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all activity logs");
    };
    activityLog.values().toArray();
  };

  // getActivityLogsByUser requires authenticated user
  public query ({ caller }) func getActivityLogsByUser(email : Text) : async [ActivityEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view activity logs");
    };
    activityLog.values().toArray().filter<ActivityEntry>(
      func(entry) { Text.equal(entry.actorEmail, email) },
    );
  };

  // getActivityLogsByTask requires authenticated user
  public query ({ caller }) func getActivityLogsByTask(taskId : Nat) : async [ActivityEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view activity logs");
    };
    activityLog.values().toArray().filter<ActivityEntry>(
      func(entry) { entry.taskId == taskId },
    );
  };

  // getActivityLogsByDateRange requires authenticated user
  public query ({ caller }) func getActivityLogsByDateRange(from : Int, to : Int) : async [ActivityEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view activity logs");
    };
    activityLog.values().toArray().filter<ActivityEntry>(
      func(entry) { entry.timestamp >= from and entry.timestamp <= to },
    );
  };

  // assignUserRole delegates to AccessControl.assignRole which has internal admin guard
  public shared ({ caller }) func assignUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func getAllUsers() : async [User] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    users.values().toArray();
  };

  public query ({ caller }) func getUserByEmail(email : Text) : async ?User {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view user details");
    };
    users.get(email);
  };
};

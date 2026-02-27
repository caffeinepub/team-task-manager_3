import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


// Apply migration from previous version

actor {
  public type Priority = {
    #High;
    #Medium;
    #Low;
  };

  public type TaskStatus = {
    #ToDo;
    #InProgress;
    #Done;
  };

  public type Task = {
    id : Nat;
    title : Text;
    description : ?Text;
    assignees : [Text];
    deadline : ?Nat;
    startTime : ?Int;
    endTime : ?Int;
    priority : Priority;
    status : TaskStatus;
    createdAt : Int;
    createdBy : Principal;
    conference : Text; // Conference is now mandatory
  };

  public type UserProfile = {
    name : Text;
  };

  public type TeamMember = {
    id : Nat;
    name : Text;
    claimedBy : ?Principal;
  };

  var nextTaskId = 1;
  var nextTeamMemberId = 1;
  let tasks = Map.empty<Nat, Task>();
  let teamMembers = Map.empty<Nat, TeamMember>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createTask(
    title : Text,
    description : ?Text,
    assignees : [Text],
    deadline : ?Nat,
    startTime : ?Int,
    endTime : ?Int,
    priority : Priority,
    conference : Text, // Now mandatory
  ) : async Task {
    if (conference.size() == 0) {
      Runtime.trap("Conference field is mandatory and cannot be empty");
    };

    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };

    let newTask : Task = {
      id = nextTaskId;
      title;
      description;
      assignees;
      deadline;
      startTime;
      endTime;
      priority;
      status = #ToDo; // Default to ToDo status on creation
      createdAt = Time.now();
      createdBy = caller;
      conference;
    };

    tasks.add(nextTaskId, newTask);
    nextTaskId += 1;
    newTask;
  };

  public query ({ caller }) func getTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    let priorityOrder = func(p : Priority) : Int {
      switch (p) {
        case (#High) { 0 };
        case (#Medium) { 1 };
        case (#Low) { 2 };
      };
    };

    func compareTasks(a : Task, b : Task) : { #equal; #greater; #less } {
      switch (a.deadline, b.deadline) {
        case (?aDeadline, ?bDeadline) {
          if (aDeadline < bDeadline) { return #less };
          if (aDeadline > bDeadline) { return #greater };
          if (priorityOrder(a.priority) < priorityOrder(b.priority)) { return #less };
          if (priorityOrder(a.priority) > priorityOrder(b.priority)) { return #greater };
          #equal;
        };
        case (null, ?_) { #greater };
        case (?_, null) { #less };
        case (null, null) { #equal };
      };
    };

    tasks.values().toArray().sort(compareTasks);
  };

  public query ({ caller }) func getTasksByAssignee(assignee : Text) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    tasks.values().toArray().filter(
      func(task) {
        task.assignees.find(
          func(a) { Text.equal(a, assignee) }
        ) != null;
      }
    );
  };

  public shared ({ caller }) func updateTaskStatus(taskId : Nat, newStatus : TaskStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update task status");
    };

    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        if (task.createdBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the task creator or an admin can update task status");
        };
        let updatedTask = { task with status = newStatus };
        tasks.add(taskId, updatedTask);
      };
    };
  };

  public shared ({ caller }) func updateTask(
    taskId : Nat,
    title : Text,
    description : ?Text,
    assignees : [Text],
    deadline : ?Nat,
    startTime : ?Int,
    endTime : ?Int,
    priority : Priority,
    conference : Text, // Now mandatory
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update tasks");
    };

    if (conference.size() == 0) {
      Runtime.trap("Conference field is mandatory and cannot be empty");
    };

    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        let updatedTask = {
          task with
          title;
          description;
          assignees;
          deadline;
          startTime;
          endTime;
          priority;
          conference; // Keep status unchanged
        };
        tasks.add(taskId, updatedTask);
      };
    };
  };

  public shared ({ caller }) func deleteTask(taskId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete tasks");
    };

    switch (tasks.get(taskId)) {
      case (null) {
        Runtime.trap("Task not found");
      };
      case (?task) {
        if (task.createdBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the task creator or an admin can delete this task");
        };
        tasks.remove(taskId);
      };
    };
  };

  public shared ({ caller }) func addTeamMember(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add team members");
    };
    let newMember : TeamMember = {
      id = nextTeamMemberId;
      name;
      claimedBy = null;
    };
    teamMembers.add(nextTeamMemberId, newMember);
    nextTeamMemberId += 1;
  };

  public query ({ caller }) func listTeamMembers() : async [TeamMember] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list team members");
    };
    teamMembers.values().toArray();
  };

  public shared ({ caller }) func removeTeamMember(memberId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove team members");
    };
    if (not teamMembers.containsKey(memberId)) {
      Runtime.trap("Team member not found");
    };
    teamMembers.remove(memberId);
  };

  public shared ({ caller }) func claimTeamMember(memberId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can claim a team member");
    };
    switch (teamMembers.get(memberId)) {
      case (null) { Runtime.trap("Team member not found") };
      case (?member) {
        switch (member.claimedBy) {
          case (?existingClaimer) {
            if (existingClaimer != caller and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: This team member has already been claimed");
            };
          };
          case (null) {};
        };
        let updatedMember = { member with claimedBy = ?caller };
        teamMembers.add(memberId, updatedMember);
      };
    };
  };
};

import Migration "migration";
import Text "mo:core/Text";
import List "mo:core/List";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";

(with migration = Migration.run)
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

  let teamMembers = List.empty<Text>();
  let tasks = List.empty<Task>();

  public shared ({ caller }) func createTask(
    id : Nat,
    title : Text,
    conferenceName : ?Text,
    description : ?Text,
    assignedTo : Text,
    deadline : Int,
    priority : Priority,
  ) : async () {
    let task : Task = {
      id;
      title;
      conferenceName;
      description;
      assignedTo;
      deadline;
      priority;
      status = #Pending;
      createdAt = Time.now();
    };
    tasks.add(task);
  };

  public shared ({ caller }) func updateTaskStatus(taskId : Nat, newStatus : Status) : async () {
    var taskFound = false;
    for (task in tasks.values()) {
      if (task.id == taskId) { taskFound := true };
    };
    if (not taskFound) { Runtime.trap("Task not found") };

    let updatedTasks = tasks.toArray().map(
      func(task) {
        if (task.id == taskId) {
          {
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
        } else {
          task;
        };
      }
    );
    tasks.clear();
    tasks.addAll(updatedTasks.values());
  };

  public shared ({ caller }) func deleteTask(taskId : Nat) : async () {
    let initialSize = tasks.size();
    let filteredTasks = tasks.filter(func(task) { task.id != taskId });
    if (filteredTasks.size() == initialSize) { Runtime.trap("Task not found") };
    tasks.clear();
    tasks.addAll(filteredTasks.values());
  };

  public query ({ caller }) func getAllTasks() : async [Task] {
    tasks.toArray();
  };

  public query ({ caller }) func getTasksByAssignee(assignee : Text) : async [Task] {
    tasks.filter(func(task) { Text.equal(task.assignedTo, assignee) }).toArray();
  };

  public shared ({ caller }) func addTeamMember(name : Text) : async () {
    for (member in teamMembers.values()) {
      if (Text.equal(member, name)) {
        Runtime.trap("Team member already exists");
      };
    };
    teamMembers.add(name);
  };

  public shared ({ caller }) func removeTeamMember(name : Text) : async () {
    let initialSize = teamMembers.size();
    let filteredMembers = teamMembers.filter(func(member) { not Text.equal(member, name) });
    if (filteredMembers.size() == initialSize) { Runtime.trap("Team member not found") };
    teamMembers.clear();
    teamMembers.addAll(filteredMembers.values());
  };

  public query ({ caller }) func getTeamMembers() : async [Text] {
    teamMembers.toArray();
  };
};

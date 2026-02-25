import List "mo:core/List";

module {
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

  type OldTask = {
    id : Nat;
    title : Text;
    description : ?Text;
    assignedTo : Text;
    deadline : Int;
    priority : Priority;
    status : Status;
    createdAt : Int;
  };

  type OldActor = {
    teamMembers : List.List<Text>;
    tasks : List.List<OldTask>;
  };

  type NewTask = {
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

  type NewActor = {
    teamMembers : List.List<Text>;
    tasks : List.List<NewTask>;
  };

  public func run(old : OldActor) : NewActor {
    let newTasks = old.tasks.map<OldTask, NewTask>(
      func(oldTask) {
        {
          id = oldTask.id;
          title = oldTask.title;
          conferenceName = null;
          description = oldTask.description;
          assignedTo = oldTask.assignedTo;
          deadline = oldTask.deadline;
          priority = oldTask.priority;
          status = oldTask.status;
          createdAt = oldTask.createdAt;
        };
      }
    );
    {
      teamMembers = old.teamMembers;
      tasks = newTasks;
    };
  };
};

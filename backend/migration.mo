import List "mo:core/List";

module {
  type Priority = {
    #High;
    #Medium;
    #Low;
  };

  type OldStatus = {
    #InProgress;
    #Completed;
    #Pending;
  };

  type NewStatus = {
    #InProgress;
    #Completed;
    #Pending;
    #CarryForward;
  };

  type OldTask = {
    id : Nat;
    title : Text;
    conferenceName : ?Text;
    description : ?Text;
    assignedTo : Text;
    deadline : Int;
    priority : Priority;
    status : OldStatus;
    createdAt : Int;
  };

  type NewTask = {
    id : Nat;
    title : Text;
    conferenceName : ?Text;
    description : ?Text;
    assignedTo : Text;
    deadline : Int;
    priority : Priority;
    status : NewStatus;
    createdAt : Int;
  };

  type OldActor = {
    tasks : List.List<OldTask>;
    teamMembers : List.List<Text>;
  };

  type NewActor = {
    tasks : List.List<NewTask>;
    teamMembers : List.List<Text>;
  };

  public func run(old : OldActor) : NewActor {
    let newTasks = old.tasks.map<OldTask, NewTask>(
      func(oldTask) {
        {
          oldTask with
          status = convertStatus(oldTask.status);
        };
      }
    );
    {
      tasks = newTasks;
      teamMembers = old.teamMembers;
    };
  };

  func convertStatus(oldStatus : OldStatus) : NewStatus {
    switch (oldStatus) {
      case (#InProgress) { #InProgress };
      case (#Completed) { #Completed };
      case (#Pending) { #Pending };
    };
  };
};

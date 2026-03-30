import Map "mo:core/Map";
import Set "mo:core/Set";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Nat64 "mo:core/Nat64";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Nat32 "mo:core/Nat32";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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

  // Type definitions

  public type Category = {
    #stock;
    #crypto;
    #etf;
    #cash;
  };

  module Category {
    public func compare(a : Category, b : Category) : Order.Order {
      Nat32.compare(toNat32(a), toNat32(b));
    };

    public func toNat32(category : Category) : Nat32 {
      switch (category) {
        case (#stock) { 0 };
        case (#crypto) { 1 };
        case (#etf) { 2 };
        case (#cash) { 3 };
      };
    };
  };

  public type Holding = {
    id : Nat;
    name : Text;
    ticker : Text;
    category : Category;
    quantity : Float;
    avgCost : Float;
    currentPrice : Float;
    userId : Principal;
  };

  module Holding {
    public func compareByValue(a : Holding, b : Holding) : Order.Order {
      Float.compare(a.currentPrice, b.currentPrice);
    };

    public func compareByName(a : Holding, b : Holding) : Order.Order {
      Text.compare(a.name, b.name);
    };

    public func compareByCategory(a : Holding, b : Holding) : Order.Order {
      switch (Category.compare(a.category, b.category)) {
        case (#equal) { Text.compare(a.name, b.name) };
        case (order) { order };
      };
    };
  };

  public type Goal = {
    id : Nat;
    name : Text;
    targetAmount : Float;
    currentAmount : Float;
    deadline : Text;
    userId : Principal;
  };

  module Goal {
    public func compareByAmount(a : Goal, b : Goal) : Order.Order {
      Float.compare(a.targetAmount, b.targetAmount);
    };

    public func compareByName(a : Goal, b : Goal) : Order.Order {
      Text.compare(a.name, b.name);
    };
  };

  // Storage
  let holdings = Map.empty<Nat, Holding>();
  let goals = Map.empty<Nat, Goal>();
  var nextHoldingId : Nat = 1;
  var nextGoalId : Nat = 1;

  // Holding CRUD operations

  public shared ({ caller }) func addHolding(
    name : Text,
    ticker : Text,
    category : Category,
    quantity : Float,
    avgCost : Float,
    currentPrice : Float
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add holdings");
    };

    let id = nextHoldingId;
    nextHoldingId += 1;

    let holding : Holding = {
      id;
      name;
      ticker;
      category;
      quantity;
      avgCost;
      currentPrice;
      userId = caller;
    };
    holdings.add(id, holding);
    id;
  };

  public shared ({ caller }) func removeHolding(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove holdings");
    };

    let holding = switch (holdings.get(id)) {
      case (null) { Runtime.trap("Holding not found") };
      case (?holding) { holding };
    };

    if (caller != holding.userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only owner can remove holding");
    };

    holdings.remove(id);
  };

  public shared ({ caller }) func updateHolding(
    id : Nat,
    name : Text,
    ticker : Text,
    category : Category,
    quantity : Float,
    avgCost : Float,
    currentPrice : Float
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update holdings");
    };

    let oldHolding = switch (holdings.get(id)) {
      case (null) { Runtime.trap("Holding not found") };
      case (?holding) { holding };
    };

    if (caller != oldHolding.userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only owner can update holding");
    };

    let updatedHolding : Holding = {
      id;
      name;
      ticker;
      category;
      quantity;
      avgCost;
      currentPrice;
      userId = oldHolding.userId;
    };

    holdings.add(id, updatedHolding);
  };

  public query ({ caller }) func getCallerHoldings() : async [Holding] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view holdings");
    };

    holdings.values().toArray().filter<Holding>(
      func(holding : Holding) : Bool {
        holding.userId == caller;
      }
    );
  };

  public query ({ caller }) func getCallerCategories() : async [Category] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view categories");
    };

    let categorySet = Set.empty<Category>();
    for (holding in holdings.values()) {
      if (holding.userId == caller) {
        categorySet.add(holding.category);
      };
    };
    categorySet.values().toArray();
  };

  // Goal CRUD operations

  public shared ({ caller }) func addGoal(
    name : Text,
    targetAmount : Float,
    currentAmount : Float,
    deadline : Text
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add goals");
    };

    let id = nextGoalId;
    nextGoalId += 1;

    let goal : Goal = {
      id;
      name;
      targetAmount;
      currentAmount;
      deadline;
      userId = caller;
    };
    goals.add(id, goal);
    id;
  };

  public shared ({ caller }) func removeGoal(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove goals");
    };

    let goal = switch (goals.get(id)) {
      case (null) { Runtime.trap("Goal not found") };
      case (?goal) { goal };
    };

    if (caller != goal.userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only owner can remove goal");
    };

    goals.remove(id);
  };

  public shared ({ caller }) func updateGoal(
    id : Nat,
    name : Text,
    targetAmount : Float,
    currentAmount : Float,
    deadline : Text
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update goals");
    };

    let oldGoal = switch (goals.get(id)) {
      case (null) { Runtime.trap("Goal not found") };
      case (?goal) { goal };
    };

    if (caller != oldGoal.userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only owner can update goal");
    };

    let updatedGoal : Goal = {
      id;
      name;
      targetAmount;
      currentAmount;
      deadline;
      userId = oldGoal.userId;
    };

    goals.add(id, updatedGoal);
  };

  public query ({ caller }) func getCallerGoals() : async [Goal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view goals");
    };

    goals.values().toArray().filter<Goal>(
      func(goal : Goal) : Bool {
        goal.userId == caller;
      }
    );
  };

  // Seed sample data for demo
  public shared ({ caller }) func seedSampleData() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can seed sample data");
    };

    // Popular stocks
    ignore await addHolding("Apple Inc.", "AAPL", #stock, 10.0, 150.0, 175.0);
    ignore await addHolding("Microsoft Corporation", "MSFT", #stock, 5.0, 300.0, 380.0);
    ignore await addHolding("Tesla Inc.", "TSLA", #stock, 8.0, 200.0, 250.0);

    // Crypto
    ignore await addHolding("Bitcoin", "BTC", #crypto, 0.5, 40000.0, 45000.0);
    ignore await addHolding("Ethereum", "ETH", #crypto, 2.0, 2500.0, 3000.0);

    // ETFs
    ignore await addHolding("SPDR S&P 500 ETF", "SPY", #etf, 20.0, 400.0, 450.0);
    ignore await addHolding("Invesco QQQ Trust", "QQQ", #etf, 15.0, 350.0, 380.0);

    // Sample goals
    ignore await addGoal("Emergency Fund", 10000.0, 5000.0, "2025-12-31");
    ignore await addGoal("Retirement Savings", 1000000.0, 250000.0, "2045-12-31");
    ignore await addGoal("House Down Payment", 50000.0, 20000.0, "2027-06-30");
  };
};

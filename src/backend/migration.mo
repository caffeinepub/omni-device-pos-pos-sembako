import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Text "mo:core/Text";

module {
  type OldProductCategory = {
    id : Nat;
    name : Text;
    active : Bool;
  };

  type OldActor = {
    categories : Map.Map<Nat, OldProductCategory>;
  };

  // Migration maps old category type to new type.
  public func run(old : OldActor) : OldActor {
    old;
  };
};

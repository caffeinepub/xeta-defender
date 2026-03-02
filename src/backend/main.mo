import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";

actor {
  type ScoreEntry = {
    playerName : Text;
    score : Nat;
  };

  module ScoreEntry {
    public func compare(entry1 : ScoreEntry, entry2 : ScoreEntry) : Order.Order {
      Nat.compare(entry2.score, entry1.score);
    };
  };

  let scores = Map.empty<Text, Nat>();

  public shared ({ caller }) func submitScore(playerName : Text, newScore : Nat) : async () {
    switch (scores.get(playerName)) {
      case (null) {
        scores.add(playerName, newScore);
      };
      case (?existingScore) {
        if (newScore > existingScore) {
          scores.add(playerName, newScore);
        };
      };
    };
  };

  public query ({ caller }) func getTopScores() : async [ScoreEntry] {
    scores.entries().toArray().map(func((name, score)) { { playerName = name; score } }).sort().sliceToArray(0, 10);
  };

  public query ({ caller }) func getPersonalBest(playerName : Text) : async Nat {
    switch (scores.get(playerName)) {
      case (null) { Runtime.trap("No scores found for this player.") };
      case (?personalBest) { personalBest };
    };
  };
};

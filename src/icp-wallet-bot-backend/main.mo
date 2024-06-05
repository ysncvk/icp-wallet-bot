import Principal "mo:base/Principal";
import Trie "mo:base/Trie";
import Text "mo:base/Text";
import Bool "mo:base/Bool";
import Option "mo:base/Option";

actor ICPWallet {
  type TelegramId = Text;
  type User = { 
    principalId: Principal;
     accountId: Text
  };

  private stable var users : Trie.Trie<TelegramId, User> = Trie.empty();

  public shared query func checkUser(telegramId: TelegramId) : async Bool {
    let result = Trie.find(users, key(telegramId), Text.equal);
    let exists = Option.isSome(result);
    return exists;
  };

  public shared func createUser (telegramId:TelegramId, user: User): async Bool{
    users := Trie.replace(
      users,
      key(telegramId),
      Text.equal,
      ?user,
    ).0;
     true;
  };

  public shared query func getUser(telegramId: TelegramId) : async ?User {
    let result = Trie.find(users, key(telegramId), Text.equal);
    return result;
  };

  private func key(x : TelegramId) : Trie.Key<TelegramId> {
    return { hash = Text.hash(x); key = x };
  };
}

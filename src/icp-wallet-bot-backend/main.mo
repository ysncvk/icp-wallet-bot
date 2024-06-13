import Principal "mo:base/Principal";
import Trie "mo:base/Trie";
import Text "mo:base/Text";
import Nat32 "mo:base/Nat32";
import Bool "mo:base/Bool";
import Option "mo:base/Option";



actor ICPWallet {
  type TelegramId = Nat32;
  type User = { 
    principalId: Principal;
    accountId: Text;
    publicKey: Text;
    privateKey: Text;
  };


  private stable var users : Trie.Trie<TelegramId, User> = Trie.empty();

  public shared query func checkUser(telegramId: TelegramId) : async Bool {
    let result = Trie.find(users, key(telegramId), Nat32.equal);
    let exists = Option.isSome(result);
    return exists;
  };

  public shared func createUser (telegramId:TelegramId, user: User): async Bool{
    users := Trie.replace(
      users,
      key(telegramId),
      Nat32.equal,
      ?user,
    ).0;
     true;
  };

  public shared query func getUser(telegramId: TelegramId) : async ?User {
    let result = Trie.find(users, key(telegramId), Nat32.equal);
    return result;
  };

   public query func getUsers () : async [User]  {
    return Trie.toArray<TelegramId, User, User>(
    users,
    func (k, v) : (User) {
      { principalId = v.principalId; accountId = v.accountId; publicKey= v.publicKey; privateKey= v.privateKey}
    }
  );
  };

  public   func showUsers(): async Text {
    let result = await getUsers();
    var output: Text = "\n__ALL-USERS_____";
    for (user in result.vals()){
      output#= "\n" # Principal.toText(user.principalId) # "\n"
    };
    output;
  };

  public func delete(telegramId : TelegramId) : async Bool {
    let result = Trie.find(users, key(telegramId), Nat32.equal);
    let exists = Option.isSome(result);
    if (exists) {
      users := Trie.replace(
        users,
        key(telegramId),
        Nat32.equal,
        null,
      ).0;
    };
    return exists;
  };

  private func key(x : TelegramId) : Trie.Key<TelegramId> {
    return { hash = x; key = x };
  };
}

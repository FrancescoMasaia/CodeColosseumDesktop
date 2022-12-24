import { CoCoSocket } from "./api.socket";
import { Packets } from "./api.packets";

export namespace Commands{
    /*
    export class Command{
      public ws?: CoCoSockets.CoCoSocket;
      public url?:string;
      public resultHandshake?:(message:Packets.Reply.Handshake)=>void; 
      public resultClosed?:()=>void;
      public resultError?:(error:any)=>void;
  
      constructor(url:string){
        this.url = url;
      }
  
      public run(){
        this.ws = new CoCoSockets.CoCoSocket(this.url!);
        this.ws.resultError = (error)=>{ this.connectionError(error); };
        this.ws.resultClosed = ()=>{ this.connectionClosed(); };
        this.ws.connect();
  
        let msg = new Packets.Request.Handshake();
        this.ws.send(msg,
          (payload, msgClass)=>{
            let msgName = Packets.Message.findPacketName(msgClass, payload);
            let message = new Packets.Reply.Handshake();
            message.fromMultiPacket(payload, msgName);
            this.handshakeRecieved(message)}, 
        Packets.Reply.Handshake.name );
      }
  
      public connectionClosed(){
  
        //alert("Command:connectionClosed");
        if (this.resultClosed){ this.resultClosed();}
      }
  
      public connectionError(error:any){
        //alert("Command:connectionError "+error);
        if (this.resultError){ this.resultError(error);}
      }
  
      public handshakeRecieved(message:Packets.Reply.Handshake){
        //alert("Command:handshakeRecieved");
        if (this.resultHandshake && message) { this.resultHandshake(message); }
      }
    }
    */

    export class Command{
      public coco: CoCoSocket;
      public url?:string;
      public debug=false; 
      public onReciveHandshake?:(message:Packets.Reply.Handshake)=>void;
      public onReciveBinary?:(message:string)=>void;
      public onRecive?:(message:Packets.PacketsPayload)=>void; 
      public onClose?:()=>void;
      public onError?:(error:any)=>void;
  
      constructor(url:string){
        this.url = url;
        this.coco = new CoCoSocket(this.url);

        this.coco.onError = (error)=>{ this.didError(error); };
        this.coco.onClose = ()=>{ this.didClose(); };
        this.coco.onRecive = (payload)=> { this.didRecive(payload) }
        this.coco.onReciveBinary = (payload)=> { this.didReciveBinary(payload) }
      }
      
      public run(){
        let msg = new Packets.Request.Handshake();
        this.coco.send(msg);
      }

      public sendBinary(data:string){
        this.log("didSendBinary: "+data);
        this.coco.sendBinary(data);
      }

      public log(...args:string[]){
        let message = this.constructor.name+": " + (args).join(" ")
        console.log(message);

        if (this.debug) alert(message);
      }
      
      public didClose(){
        this.log("didClose");
        if (this.onClose){ this.onClose();}
      }
  
      public didError(error:any){
        this.log("didError "+error);
        if (this.onError){ this.onError(error);}
      }

      public didReciveBinary(payload:string){
        this.log("didReciveBinary:\n"+payload);
        if(this.onReciveBinary){this.onReciveBinary(payload)}
      }

      public didRecive(payload:Packets.PacketsPayload){
        this.log("didRecive");
        if(this.onRecive){ this.onRecive(payload) }
        
        let message = payload.getMessage(Packets.Reply.Handshake)
        if (message){ this.didReciveHandshake(message); }
      }

      
      public didReciveHandshake(message:Packets.Reply.Handshake){
        this.log("didRecieveHandshake");
        if (this.onReciveHandshake) { this.onReciveHandshake(message); }
      }
    }
  
    export class GameList extends Command{
      public onRecieveGameList?:(message:Packets.Reply.GameList)=>void
      
      public override didReciveHandshake( handshake: Packets.Reply.Handshake){
        super.didReciveHandshake(handshake);

        let msg = new Packets.Request.GameList();
        this.coco.send(msg);
      }

      public override didRecive(payload:Packets.PacketsPayload){
        super.didRecive(payload);
        let message = payload.getMessage(Packets.Reply.GameList)
        if (message){ this.didReciveGameList(message); }
      }
        
      public didReciveGameList(message:Packets.Reply.GameList){
        this.log("didRecieveGameList");
        if (this.onRecieveGameList) { this.onRecieveGameList(message); }
      }
    }

    export class GameDescription extends Command{
      public onRecieveGameDescription?:(message:Packets.Reply.GameDescription)=>void
      private msg:Packets.Request.GameDescription;
  
      constructor(url:string, game:string){
        super(url);
        this.msg = new Packets.Request.GameDescription(game);
      }

      public override didReciveHandshake( handshake: Packets.Reply.Handshake){
        super.didReciveHandshake(handshake);

        let msg = new Packets.Request.GameDescription();
        this.coco.send(msg);
      }

      public override didRecive(payload:Packets.PacketsPayload){
        super.didRecive(payload);
        let message = payload.getMessage(Packets.Reply.GameDescription)
        if (message){ this.didReciveGameDescription(message); }
      }
        
      public didReciveGameDescription(message:Packets.Reply.GameDescription){
        this.log("didRecieveGameList");
        if (this.onRecieveGameDescription) { this.onRecieveGameDescription(message); }
      }
    }
  
    export class LobbyList extends Command{
      public onReciveLobbyList?:(message:Packets.Reply.LobbyList)=>void;
      
      public override didReciveHandshake( handshake: Packets.Reply.Handshake){
        super.didReciveHandshake(handshake);
        
        let msg = new Packets.Request.LobbyList();
        this.coco!.send(msg);
      }

      public override didRecive(payload:Packets.PacketsPayload){
        super.didRecive(payload);
        let message = payload.getMessage(Packets.Reply.LobbyList)
        if (message){ this.didRecieveLobbyList(message);}
      }
        
      public didRecieveLobbyList(message:Packets.Reply.LobbyList){
        this.log("didRecieveLobbyList");
        if (this.onReciveLobbyList) { this.onReciveLobbyList(message); }
      }
    }
  
    export class NewLobby extends Command {
      public onReciveNewLobby?:(message:Packets.Reply.GameNew)=>void;

      private msg:Packets.Request.GameNew;
  
      constructor(url:string, lobby_name?:string, game_name?:string, num_palyer?:number, num_bots?:number, timeout?:number, args?:{}, password?:string){
        super(url);
        this.msg = new Packets.Request.GameNew(lobby_name, game_name, num_palyer, num_bots, timeout, args, password);
      }
      
      public override didRecive(payload:Packets.PacketsPayload){
        super.didRecive(payload);
        let message = payload.getMessage(Packets.Reply.GameNew)
        if (message){
          this.didRecieveNewLobby(message);
        }
      }
        
      public didRecieveNewLobby(message:Packets.Reply.GameNew){
        this.log("didRecieveNewLobby");
        if (this.onReciveNewLobby) { this.onReciveNewLobby(message); }
      }
            
      public override didReciveHandshake( handshake: Packets.Reply.Handshake){
        super.didReciveHandshake(handshake);
        this.coco!.send(this.msg);
      }
    }
  
    export class Connect extends Command{
      public onReciveJoin?:(message:Packets.Reply.LobbyJoinedMatch )=>void;
      public onReciveUpdate?:(message:Packets.Reply.LobbyUpdate)=>void;
      public onReciveStart?:(message:Packets.Reply.MatchStarted)=>void;
      public onReciveEnd?:(message:Packets.Reply.MatchEnded) => void;
      
      private msg:Packets.Request.LobbyJoinMatch;
  
      constructor(url:string, lobby_id:string, player_name:string, lobby_password?:string){
        super(url);
        this.msg = new Packets.Request.LobbyJoinMatch(lobby_id, player_name, lobby_password);
      }

      public override didReciveHandshake(handshake: Packets.Reply.Handshake){
        super.didReciveHandshake(handshake);
        this.coco.send(this.msg);
      }
      
      public override didRecive(payload: Packets.PacketsPayload): void {
        super.didRecive(payload);
        let message;
        message = payload.getMessage(Packets.Reply.LobbyJoinedMatch);
        if (message){ this.didRecieveJoin(message); }

        message = payload.getMessage(Packets.Reply.LobbyUpdate)
        if (message){ this.didRecieveUpdate(message); }

        message = payload.getMessage(Packets.Reply.MatchStarted)
        if (message){ this.didRecieveStart(message); }
        
        message = payload.getMessage(Packets.Reply.MatchEnded)
        if (message){ this.didRecieveEnd(message); }
      }

      public didRecieveJoin(message: Packets.Reply.LobbyJoinedMatch){
        this.log("didRecieveJoin");
        if (this.onReciveJoin ) { this.onReciveJoin(message); }
      }

      public didRecieveUpdate(message: Packets.Reply.LobbyUpdate){
        this.log("didRecieveUpdate");
        if (this.onReciveUpdate ) { this.onReciveUpdate(message); }
      }
      
      public didRecieveStart(message: Packets.Reply.MatchStarted){
        this.log("didRecieveStart");
        if (this.onReciveStart ) { this.onReciveStart(message); }
      }
      
      public didRecieveEnd(message: Packets.Reply.MatchEnded){
        this.log("didRecieveEnd");
        this.coco.closeConnection();
        if (this.onReciveEnd ) { this.onReciveEnd(message); }
      }
    }

    export class Spectate extends Command{
      public onReciveJoin?:(message:Packets.Reply.SpectateJoined )=>void;
      public onReciveUpdate?:(message:Packets.Reply.LobbyUpdate)=>void;
      public onReciveStart?:(message:Packets.Reply.SpectateStarted)=>void;
      public onReciveSync?:(message:Packets.Reply.SpectateSynced) => void;
      public onReciveEnd?:(message:Packets.Reply.SpectateEnded) => void;

      private msg:Packets.Request.SpectateJoin;
  
      constructor(url:string, lobby_id:string){
        super(url);
  
        this.msg = new Packets.Request.SpectateJoin(lobby_id);
      }
  
      public override didReciveHandshake(handshake: Packets.Reply.Handshake){
        super.didReciveHandshake(handshake);
  
        this.coco!.send(this.msg)
      }

      public override didRecive(payload: Packets.PacketsPayload): void {
        super.didRecive(payload);
        let message;

        message = payload.getMessage(Packets.Reply.SpectateJoined)
        if (message){ this.didRecieveJoin(message); }

        message = payload.getMessage(Packets.Reply.LobbyUpdate)
        if (message){ this.didRecieveUpdate(message);}
        
        message = payload.getMessage(Packets.Reply.SpectateStarted)
        if (message){ this.didRecieveStart(message);}

        message = payload.getMessage(Packets.Reply.SpectateSynced)
        if (message){ this.didRecieveStart(message);}

        message = payload.getMessage(Packets.Reply.SpectateEnded)
        if (message){ this.didRecieveEnd(message);}

      }

      public didRecieveJoin(message: Packets.Reply.LobbyJoinedMatch){
        this.log("LobbyJoinedMatch");
        if (this.onReciveJoin ) { this.onReciveJoin(message); }
      }

      public didRecieveUpdate(message: Packets.Reply.LobbyUpdate){
        this.log("LobbyUpdate");
        if (this.onReciveUpdate ) { this.onReciveUpdate(message); }
      }
      
      public didRecieveStart(message: Packets.Reply.MatchStarted){
        this.log("MatchStarted");
        if (this.onReciveStart ) { this.onReciveStart(message); }
      }
      
      public didRecieveEnd(message: Packets.Reply.MatchEnded){
        this.log("MatchEnded");
        this.coco.closeConnection();
        if (this.onReciveEnd ) { this.onReciveEnd(message); }
      }
    }
  }
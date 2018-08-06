
class Body extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            messages: [],
            users: [],
            textContent: "",
            icon: window.sessionStorage.getItem("icon"),
            iconClicked: false,
            userLogs: []
        };

        this.scroller = null;

        this.handleServerMsg=this.handleServerMsg.bind(this);
        this.sendMsg=this.sendMsg.bind(this);
        this.joinUser=this.joinUser.bind(this);
        this.handleTextChange=this.handleTextChange.bind(this);
        this.scrollToBottom = this.scrollToBottom.bind(this);
        this.setScrollerRef = element => this.scroller = element;
        this.renderUserList = this.renderUserList.bind(this);
        this.renderMsgList = this.renderMsgList.bind(this);
        this.logOut = this.logOut.bind(this);
        this.profileOnClick=this.profileOnClick.bind(this);

        //--todo--if the user already logged in(found in userList on server), jump to login page
        this.connection = new WebSocket("ws://localhost:3000");
        this.connection.onmessage = this.handleServerMsg;
        this.connection.onopen = this.joinUser;
    }

    handleServerMsg(event) {
        let data = JSON.parse(event.data);  //receive a message object: userList, type, user, data
        this.setState({users: data.userList});
        this.setState({messages: this.addElmToList(this.state.messages, data.data)});

    }

    findIconById(id){
        for(let user of this.state.users){
            if(user.userId===id)
                return user.icon;
        }
    }

    addElmToList(arr, elm){
        arr.push(elm);
        return arr;
    }

    sendMsg(msg) {
        if (!msg.trim() || this.connection.readyState!==1)
            return;
        //send to wsSever, which puts it into objcet and sends back to all clients
        this.connection.send(
            JSON.stringify(
                {userId: sessionStorage.getItem("userId"), type: "chat", data: msg.trim()
            }));
        this.setState({textContent: ""});
        this.render();
    }


    joinUser(){
    // send a msg to server of the type "join"
        if(!window.sessionStorage.getItem("username")){
            return window.location.href="login.html";
        }
        // fetch("/logIn?userId="+sessionStorage.getItem("userId"),{method:"GET"});

        let msg = {};
        // msg.userId = sessionStorage.getItem("userId");
        msg.userId = sessionStorage.getItem("userId");
        msg.type = "join";
        msg.data = " joined the chat";
        this.connection.send(JSON.stringify(msg));

    }

    handleTextChange(){
        this.setState({textContent: event.target.value});
    }

    renderUserList(users){
        return users.map(user=>{
            if(user.online){
                return <li>
                    <div className={"message"}>
                        <img src={user.icon} />
                        <span>{user.username}</span>
                    </div>
                </li>
            } else{
                return null;
            }
        })
    }

    renderMsgList(data) {
        return data.map((elm) => {
            // console.log("in render list", elm.userId, this.findIconById(elm.userId));
            return <li>
                <div className={"message"}>
                    <img src={this.findIconById(elm.userId) } />
                    <span>{elm.data}</span>
                </div>
            </li>
        });
    }

    scrollToBottom(){
        const scrollHeight = this.scroller.scrollHeight;
        const height = this.scroller.clientHeight;
        const maxScrollTop = scrollHeight - height;
        this.scroller.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }

    profileOnClick(){
        // let elm = event.target;
        this.setState({iconClicked: !this.state.iconClicked});
        // window.location.href = "user_profile.html";
    }

    logOut(){
        this.connection.close();
        window.location.href = "login.html";
    }

    componentDidMount(){
        this.scrollToBottom();
    }

    componentDidUpdate(){
        this.scrollToBottom();
    }

    render() {
        return <div className={"chat"}>
            <div id={"header"}>
                <div id={"icon"} >
                    <img  src={this.state.icon} onClick={this.profileOnClick}/>
                    <SettingList clicked = {this.state.iconClicked} resetClick = {this.profileOnClick}/>
                </div>
                <button onClick={this.logOut}>Log Out</button>
            </div >
            <div id={"window"}>
                <div id={"userWindow"}>
                    <UserList users={this.state.users}
                              renderList={this.renderUserList}/>
                </div>
                <div id={"chatWindow"}>
                    <MsgList msgs={this.state.messages}
                             renderList={this.renderMsgList}
                             setScroller={this.setScrollerRef}/>
                </div>
                <div id={"textBox"}>
                    <TextBox sendMsg={this.sendMsg}
                             text={this.state.textContent}
                             handleTextChange={this.handleTextChange}/>
                    {/*send msg to client */}
                </div>
            </div>
        </div>
    }
}

let SettingList = React.createClass({
   render: function () {
       if(this.props.clicked){
           // this.props.resetClick();
           return <div>
               <ul>
                   <li><a href={"user_profile.html"}>Profile</a></li>
                   {/*<span>{"  "}</span><li><a href={"user_profile.html"}>Settings</a></li>*/}
                   {/*<li><a href={}></a></li>*/}
               </ul>
           </div>
       } else{
           return null;
       }
}});

let UserList = React.createClass({

    render: function () {
        return <div>
            <h2> Members </h2>
                <ul>{this.props.renderList(this.props.users)}</ul>
        </div>
    }
});

let MsgList = React.createClass({
    render: function () {

        return <div>
            <h2> ChatRoom </h2>
                <ul ref={this.props.setScroller}>
                    {this.props.renderList(this.props.msgs)}
                </ul>
        </div>
    }
});

let TextBox = React.createClass({

    sendByEnter: function(event){
        if(event.key==="Enter"){
            this.props.sendMsg(this.props.text);
        }
    },
    render: function () {
        {/*listeners 后面一定要是一个function, 如果不为function,每次render它都会自动运行regardless of events*/}
        return <div>
            <textarea rows={"4"} cols={"50"} autoFocus={true} onChange={this.props.handleTextChange} onKeyPress={this.sendByEnter} value={this.props.text}>
                Say something</textarea>
            <button onClick={() => {this.props.sendMsg(this.props.text)}}>SEND</button>
        </div>
    }
});

ReactDOM.render(<Body />, document.body);




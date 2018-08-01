/*
when click logout, need to clear sessions since they dont clear themselves if the tab is still open

 */


class Body extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            messages: [],
            users: [],
            textContent: "",
            icon: window.sessionStorage.getItem("icon"),
            iconClicked: false
        };

        this.scroller = null;

        this.handleServerMsg=this.handleServerMsg.bind(this);
        this.sendMsg=this.sendMsg.bind(this);
        this.joinUser=this.joinUser.bind(this);
        this.handleTextChange=this.handleTextChange.bind(this);
        this.scrollToBottom = this.scrollToBottom.bind(this);
        this.setScrollerRef = element => this.scroller = element;
        this.renderList = this.renderList.bind(this);
        this.logOut = this.logOut.bind(this);
        // this.onUnload = this.onUnload.bind(this);
        this.profileOnClick=this.profileOnClick.bind(this);

        this.connection = new WebSocket("ws://localhost:3000");
        this.connection.onmessage = this.handleServerMsg;
        this.connection.onopen = this.joinUser;
        //when jumping to another
        window.onbeforeunload = this.logOut;
        console.log("icon clicked", this.state.iconClicked);
    }

    handleServerMsg(event) {
        let msg = JSON.parse(event.data);  //receive a message object: users, type, user, data
        this.setState({users: msg.users});
        console.log("users in client", this.state.users, "msg", this.state.messages);
        this.setState({messages: this.addElmToList(this.state.messages, msg.data)});
        // sessionStorage.setItem("logs", JSON.stringify(this.state.messages));
        // sessionStorage.setItem("users", JSON.stringify(this.state.users));
    }

    // onUnload(){
    //     //not working in here
    //     if(!this.state.iconClicked) {
    //         this.connection.send(
    //             JSON.stringify({user:window.sessionStorage.getItem("username"),type: "left", data: " left the chat"}));
    //         fetch("/logout?userId="+sessionStorage.getItem("userId"),{method:"GET"});
    //     }
    // }

    sendMsg(msg) {
        if (!msg.trim() || this.connection.readyState!==1)
            return;
        //send to wsSever, which puts it into objcet and sends back to all clients
        console.log('sending...', msg);
        this.connection.send(
            JSON.stringify({
                user:window.sessionStorage.getItem("username"), type: "chat", data: msg.trim()
            }));
        this.setState({textContent: ""});
        this.render();
    }

    addElmToList(arr, elm) {
        arr.push(elm);
        return arr;
    }

    joinUser(){
    // send a msg to server of the type "join"
        if(!window.sessionStorage.getItem("username")){
            window.location.href="login.html";
            return;
        }
        // fetch("/logIn?userId="+sessionStorage.getItem("userId"),{method:"GET"});

        let msg = {};
        // msg.userId = sessionStorage.getItem("userId");
        msg.user = window.sessionStorage.getItem("username");
        msg.type = "join";
        msg.data = " joined the chat";
        // msg.disbroadcast = false;

        // let entry = window.performance.getEntriesByType("navigation");
        // if(entry[0].type==="reload"){
        //     // this.setState({messages: JSON.parse(sessionStorage.getItem("logs"))});
        //     // this.setState({users: JSON.parse(sessionStorage.getItem("users"))});
        //     // return;
        //     msg.broadcast = false;
        // }
        this.connection.send(JSON.stringify(msg));



    }

    handleTextChange(){
        this.setState({textContent: event.target.value});
    }

    renderList(data) {

        const listItems = data.map((elm) => {
            return <li>
                <div className={"message"}><img src={this.state.icon}/>
                    <span>{elm}</span>
                </div>
            </li>
        });
        return listItems;
    }

    scrollToBottom(){
        const scrollHeight = this.scroller.scrollHeight;
        const height = this.scroller.clientHeight;
        const maxScrollTop = scrollHeight - height;
        this.scroller.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }

    profileOnClick(event){
        // let elm = event.target;
        console.log("onclick", this.state.iconClicked);
        this.setState({iconClicked: !this.state.iconClicked});
        // window.location.href = "user_profile.html";
    }

    logOut(){
        if(!window.sessionStorage.getItem("username"))
            return;
        let msg = {};
        msg.user = window.sessionStorage.getItem("username");
        msg.type = "left";
        msg.data = " left the chat";

        this.connection.send(JSON.stringify(msg));
        // fetch("/logout?userId="+sessionStorage.getItem("userId"),{method:"GET"});
        // window.sessionStorage.clear();
        window.location.href = "login.html";


        //
        // let entry = window.performance.getEntriesByType("navigation");
        // if(entry[0].type==="reload"){
        //     // this.setState({messages: JSON.parse(sessionStorage.getItem("logs"))});
        //     // this.setState({users: JSON.parse(sessionStorage.getItem("users"))});
        //     // return;
        //     msg.broadcast = false;
        // }
        // this.connection.send(JSON.stringify(msg));
        // fetch("/logout?userId="+sessionStorage.getItem("userId"),{method:"GET"});
        // window.sessionStorage.clear();
        // window.location.href = "login.html";
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
                              renderList={this.renderList}/>
                </div>
                <div id={"chatWindow"}>
                    <MsgList msgs={this.state.messages}
                             renderList={this.renderList}
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
};

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
            <h2> Messages </h2>
                <ul ref={this.props.setScroller}>
                    {this.props.renderList(this.props.msgs)}
                </ul>
        </div>
    }
});

let TextBox = React.createClass({

    sendByEnter: function(event, msg){
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




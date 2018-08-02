class Body extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            icon: window.sessionStorage.getItem("icon"),
            username: window.sessionStorage.getItem("username"),
            userId: window.sessionStorage.getItem("userId"),
            msg: "",
            iconClicked: false,

            newName: "",
            oldPwd: "",
            pwd1: "",
            pwd2: ""
        };


        this.changeIconClick = this.changeIconClick.bind(this);
        this.changeIcon = this.changeIcon.bind(this);
        this.updateIcon = this.updateIcon.bind(this);
        this.changePassword = this.changePassword.bind(this);
        this.rename = this.rename.bind(this);
    }

    changeIconClick(){
        this.setState({iconClicked: !this.state.iconClicked})
    }

    changeIcon(newIcon){
        this.setState({icon: newIcon});
    }

    updateIcon(){
        window.localStorage.setItem(sessionStorage.getItem("userId"), this.state.icon);
        window.sessionStorage.setItem("icon", this.state.icon);
        this.setState({msg: "Icon updated."});
    }

    goToChat(){
        location.href = "main.html";
    }

    changePassword(e){
        e.preventDefault();
        if(this.state.pwd1 !== this.state.pwd2){
            return this.setState({msg: "The retyped password does not match"});
        }
        fetch("/updatePassword/", {
            method:"POST", body: JSON.stringify({oldPwd: this.state.oldPwd, newPwd: this.state.pwd1}),
            headers: {"Content-Type": "application/json"}, credentials: "include"
        }).then(response=>{
            if(response.ok){
                response.json().then(data=>{
                    this.setState({msg: data.msg});
                });
            } else{
                this.setState({msg: response.statusText});
            }
        })

    }

    rename(e){
        e.preventDefault();
        fetch("/updateUsername/", {
            method:"POST", body: JSON.stringify({username: this.state.newName}),
            headers: {"Content-Type": "application/json"}, credentials: "include"
        }).then(response=>{
            console.log(response);
            if(response.ok){
                sessionStorage.setItem("username", this.state.newName);
                this.setState({username: this.state.newName});
                response.json().then(data=>{
                    this.setState({msg: data.msg});
                });
            }else{
                this.setState({msg: response.statusText});
            }
        })

    }

    render() {
        return <div>
            <div className={"header"}>
                <button id={"goToChat"} onClick={this.goToChat}>Back to chat</button>
                <img src={this.state.icon} id={"icon_display"} onClick={this.changeIconClick}/>
                <h2>UserId: {this.state.userId}</h2>
                <ChangeIcon iconClicked={this.state.iconClicked}
                            changeIcon={this.changeIcon} updateIcon={this.updateIcon}/>
            </div>

            <div className={"forms"}>
                <form >
                    <span>Username: {this.state.username}</span><br/>
                    <input type={"text"} placeholder={"new username"} required={true}
                           onChange={(e)=>{this.setState({newName: e.target.value})}}/><br/>
                    <input type={"submit"} value={"Rename"} onClick={this.rename} />
                    <br/>
                </form>
                <form >
                    <span>Password  </span> <br/>
                    <input type={"password"} placeholder={"old password"} required={true}
                           onChange={(e)=>{this.setState({oldPwd: e.target.value})}}/> <br/>
                    <input type={"password"} placeholder={"new password"} required={true}
                           onChange={(e)=>this.setState({pwd1: e.target.value})}/> <br/>
                    <input type={"password"} placeholder={"retype new password"} required={true}
                           onChange={(e)=>this.setState({pwd2: e.target.value})}/> <br/>
                    <input type={"submit"} value={"Reset Password"} onClick={this.changePassword}/>
                    <br/>
                    {/*input tag 如果有close tag会报错*/}
                </form>
            </div>
            <p id={"result"}>{this.state.msg}</p>
        </div>
    }
}


let ChangeIcon = React.createClass({

    fileUpload: function(event){
        if(event.target.files && event.target.files[0]){
            let reader = new FileReader();
            reader.onload = function (e) {
                this.props.changeIcon(e.target.result);
            }.bind(this);
            reader.readAsDataURL(event.target.files[0]);
        }
    },

    recoverIcon(){
        this.props.changeIcon(window.sessionStorage.getItem("icon"));
        document.getElementById("changeIcon").reset();
    },

    render: function () {
        if(this.props.iconClicked){
            return <div>
                <form id={"changeIcon"}>
                    <input type="file" name="filename" accept="image/gif, image/jpeg, image/png" onChange={this.fileUpload}/>
                    <button onClick={this.recoverIcon}>Cancel</button>
                    <button onClick={this.props.updateIcon}>Upload</button>
                </form>
                <br/>
            </div>
        } else
            return null;
    }
});

ReactDOM.render(<Body />, document.body);

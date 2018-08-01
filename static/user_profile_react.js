class Body extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            icon: window.sessionStorage.getItem("icon"),
            username: window.sessionStorage.getItem("username"),
            userId: window.sessionStorage.getItem("userId"),
            msg: "",
            file: null,
            iconClicked: false
        };

        // fetch("/getUserInfo/", {method: "GET", credentials: "include"})
        //     .then(response=>{
        //         if(response.ok){
        //             response.json().then(data=>{
        //                 console.log("data", data);
        //                 this.setState({username: data.username, icon: data.icon});
        //             })
        //         } else{
        //             this.setState({errorMsg: response.error})
        //         }
        //     });

        this.changeIconClick = this.changeIconClick.bind(this);
        this.changeIcon = this.changeIcon.bind(this);
        this.updateIcon = this.updateIcon.bind(this);
    }

    changeIconClick(){
        this.setState({iconClicked: !this.state.iconClicked})
    }

    changeIcon(newIcon){
        this.setState({icon: newIcon});
    }

    updateIcon(event){
        console.log("iam in update icon");
        let body = this;
        window.sessionStorage.setItem("icon", this.state.icon);
        console.log("file", event.target.files[0]);
        if(event.target.files && event.target.files[0]){
            console.log("fetching");
            fetch("/fileupload/", {
                method: "POST", headers:{"Content-Type": "multipart/form-data"},
                body: event.target, credentials:"include"
            }).then(response=>{
                console.log("response", response);
                if(response.ok){
                    response.json().then(data=>{
                        if(data.status==="ok")
                            body.setState({msg: "Icon updated successfully."})
                    })
                }
            })
        }
    }

    goToChat(){
        location.href = "main.html";
    }

    render() {
        return <div>
            <h1>{this.state.userId}</h1>
            <img src={this.state.icon} id={"icon_display"} onClick={this.changeIconClick}/>
            <ChangeIcon  changeIcon={this.changeIcon}
                         iconClicked={this.state.iconClicked}
                         updateIcon={this.updateIcon}/>
            <form>
                <input type={"text"} placeholder={"username"}/>
                <br/>
                <button>Rename</button> <button>Reset Password</button>
                <br/>
                {/*input tag 如果有close tag会报错*/}
                <input type={"submit"} value={"Submit"} />
            </form>
            <br/>
            <p id={"result"}>{this.state.msg}</p>
            <br/>
            <button onClick={this.goToChat}>Go back to chat</button>

        </div>
    }
};

let ChangeIcon = React.createClass({

    fileUpload: function(event){
        if(event.target.files && event.target.files[0]){
            let reader = new FileReader();
            reader.onload = function (e) {
                console.log("url", e.target.result);
                this.props.changeIcon(e.target.result);
            }.bind(this);
            reader.readAsDataURL(event.target.files[0]);
        }
    },

    recoverIcon(){
        this.props.changeIcon(window.sessionStorage.getItem("icon"));
    },

    render: function () {
        if(this.props.iconClicked){
            return <div>
                <form encType={"multipart/form-data"} >
                    <input type="file" name="filename" accept="image/gif, image/jpeg, image/png" onChange={this.fileUpload}/>
                    <input type={"submit"} value={"Upload"} onClick={this.props.updateIcon}/>
                </form>
                <button onClick={this.recoverIcon}>Cancel</button>
                <br/>
            </div>
        } else
            return null;
    }
});

ReactDOM.render(<Body />, document.body);

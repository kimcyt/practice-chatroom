
//props 是不可变的，而 state 可以根据与用户交互来改变
// var ChangeTitle = React.createClass({
//     getDefaultProps: function(){ //set prop attributes here
//         return {color: "green"}
//     },
//     propTypes:{ //设定props的数据类型，传入错误时会报错
//       color: React.PropTypes.string.isRequired,
//     },
//     getInitialState: function () {
//         return {color: this.props.color};  //set initial state to be green
//     },
//     handleClick: function () {  //reset state for a click event
//         this.setState({color: this.state.color===this.props.color? "red": this.props.color},
//             ()=>{console.log("setState设置成功，且组件重新渲染")});
//         //setState可以接受function作为第一个参数，return {new state}
//     },
//     render: function () {
//         console.log('render');
//         let style = {
//             color: this.state.color
//         };
//         return (<h1 onClick = {this.handleClick} style={style}> Welcome to the ChatRoom </h1>);
//     }
// });
// //为组件传入props.color
// ReactDOM.render(<ChangeTitle color={"black"}/>, document.getElementById("header"));

let RenderBody = React.createClass({
    getInitialState: function () {
        return {
            user: "",
            password: "",
            result: ""
        };
    },
    handleUsernameChange: function (event) {
        this.setState({user: event.target.value});
    },
    handlePasswordChange: function(event) {
        this.setState({password: event.target.value});
    },
    onSubmit: function(event){
        //fetch authentication result
        event.preventDefault();
        let userInfo = "userId=" + this.state.user + "&password=" + this.state.password;
        //默认情况下，fetch 不会从服务端发送或接收任何 cookies, 如果站点依赖于用户 session，则会导致未经认证的请求
        // （要发送 cookies，必须设置 credentials 选项）
        //用请求携带的sessionId换取数据
        fetch("/login?" + userInfo, {method:"GET", credentials: "include"})
            .then(response => {
                if(response.ok){
                    response.json().then(data=>{
                        if(data.status==="ok"){
                            let userInfo = data.userInfo;
                            window.sessionStorage.setItem("userId", userInfo.userId);
                            window.sessionStorage.setItem("username", userInfo.username);
                            window.sessionStorage.setItem("icon", userInfo.icon);
                            window.location.href = data.location;
                        }
                        else
                            this.setState({result: data.errorMsg});
                    })
                } else{
                    this.setState({result: response.statusText});
                }
            })
    },
    render: function () {
        let user = this.state.user;
        return <div>
            {/*render header*/}
            <div id={"header"}>
                <h1>Welcome to the ChatRoom</h1>
                <Greeting user={user} />
            </div>
            {/*render body*/}
            <div>
                <UserInput user={user}
                           onSubmit = {this.onSubmit}
                           result = {this.state.result}
                           updateUser = {this.handleUsernameChange}
                           updatePassword = {this.handlePasswordChange}
                />
            </div>
        </div>
    }
});

/////////////child components

let UserInput = React.createClass({
    render: function(){
        return <div className={"userInputs"}>
            <form method={"GET"} >
                <span>UserId</span><input type={"text"} onChange={this.props.updateUser} required={true}/>
                <br/>
                <span>Password</span><input type={"password"} onChange={this.props.updatePassword} required={true}/>
                <br/>
                <input type={"submit"} value={"Login"} onClick={this.props.onSubmit}/>
                <br/>
                <br/>
                <a href={"signup.html"}> Sign Up </a>
            </form>
            <p id={"loginResult"}>{this.props.result}</p>
        </div>
    }
});

let Greeting = React.createClass({
    render: function(){
        return <h2>{"Hello "+ this.props.user}</h2>
    }
});
ReactDOM.render(<RenderBody />, document.body);


/////////////////////////基本JSX

//用ref=“ref name" 获得组件引用

//JSX 中使用 JavaScript 表达式。表达式写在花括号 {} 中
//在代码中嵌套多个 HTML 标签，需要使用一个 div 元素包裹它
//给标签添加自定义属性需要使用 data- 前缀

// ReactDOM.render(template,targetDOM) 方法接收两个参数：
// --第一个是创建的模板，多个 dom 元素外层需使用一个标签进行包裹，如 <div>；
// --第二个参数是插入该模板的目标位置。

//React 推荐使用内联样式。我们可以使用 camelCase 语法来设置内联样式. React 会在指定元素数字后自动添加 px 。以下实例演示了为 h1 元素添加 myStyle 内联样式：
// var myStyle = {
//     fontSize: 100,
//     color: '#FF0000'
// };
// ReactDOM.render(
//     <h1 style = {myStyle}>菜鸟教程</h1>,
//     document.getElementById('example')
// );

//1、在标签内部的注释需要花括号
//{/*注释...*/}
//2、在标签外的的注释不能使用花括号

//JSX 允许在模板中插入数组，数组会自动展开所有成员：
//var arr = [
//   <h1>菜鸟教程</h1>,
//   <h2>学的不仅是技术，更是梦想！</h2>,
// ];
// ReactDOM.render(
// <div>{arr}</div>,
// document.getElementById('example')
// );

// 要渲染 HTML 标签，只需在 JSX 里使用小写字母的标签名。
// var myDivElement = <div className="foo" />;      /////////my为小写
// ReactDOM.render(myDivElement, document.getElementById('example'));

// 要渲染 React 组件，只需创建一个大写字母开头的本地变量。
// var MyComponent = React.createClass({/*...*/});    ////////My为大写, createClass 生成组件
/////put components in <component /> to objectify the component and output data
// var myElement = <MyComponent someProperty={true} />;
// ReactDOM.render(myElement, document.getElementById('example'));


/////////////////组件
//原生 HTML 元素名以小写字母开头，而自定义的 React 类名以大写字母开头，
//组件类只能包含一个顶层标签，否则也会报错。

// 如果我们需要向组件传递参数，可以使用 this.props 对象,实例如下：
//在添加属性时， class 属性需要写成 className ，for 属性需要写成 htmlFor
//
// var HelloMessage = React.createClass({
//     render: function() {
//         return <h1>Hello {this.props.name}</h1>;
//     }
// });
//
// ReactDOM.render(
// <HelloMessage name="Runoob" //不可以加style/>   ///组件名内不能使用 style 样式，只能写在html标签内
//     document.getElementById('example')
// );



//我们可以通过创建多个组件来合成一个组件，即把组件的不同功能点进行分离。
// var WebSite = React.createClass({
//     getInitialState 来设置this.state的值
//     render: function() {
//         return (
//             <div>
    //             <Name name={this.state.name} />    ///Name和Link分别为两个组件
        //         <Link site={this.state.site} />    //name和site成为子组件的this.props.name/site
    //         </div>
//     );
//     }
// });
// ReactDOM.render(
// <WebSite name="菜鸟教程" site=" http://www.runoob.com" />,
//     document.getElementById('example')
// );


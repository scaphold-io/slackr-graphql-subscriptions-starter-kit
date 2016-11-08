import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './index.scss';
import React from 'react';
import gql from 'graphql-tag';
import { Link, browserHistory } from 'react-router';
import { graphql, compose } from 'react-apollo';

const LoginQuery = gql`
mutation Login($cred: LoginUserInput!) {
  loginUser(input: $cred) {
    user {
      id
      username
    }
    token
  }
}
`

const CreateUserQuery = gql`
mutation CreateUser($user: CreateUserInput!) {
  createUser(input: $user) {
    user {
      id
      username
    }
    token
  }
}
`

class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      cred: {
        username: '',
        password: '',
      }
    }
  }

  onUsernameChanged(e) {
    this.setState({
      cred: {
        password: this.state.cred.password,
        username: e.target.value,
      }
    })
  }

  onPasswordChanged(e) {
    this.setState({
      cred: {
        password: e.target.value,
        username: this.state.cred.username,
      }
    })
  }

  render() {
    return (
      <div className="container">
        <div style={{ padding: '15px' }}>
          <h1>Login</h1>
          <input type="text" placeholder="username" className="form-control"/>
          <input type="text" placeholder="password" className="form-control"/>
          <button type="submit" className="btn btn-primary">Login</button>
          <button type="submit" className="btn btn-primary">Register</button>
        </div>
      </div>
    )
  }
}

export default compose(
  graphql(LoginQuery, {
    props: ({ mutate }) => ({
      login: (cred) => mutate({ variables: { cred: cred }})
    })
  }),
  graphql(CreateUserQuery, {
    props: ({ mutate }) => ({
      createUser: (user) => mutate({ variables: { user: user }})
    })
  })
)(Login);
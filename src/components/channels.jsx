import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './index.scss';
import React from 'react';
import { Link } from 'react-router';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import AuthService from '../utilities/auth';
import config from '../config';

const UpdateUserQuery = gql`
mutation UpdateUser($user: UpdateUserInput!) {
  updateUser(input: $user) {
    changedUser {
      id
      username
      picture
    }
  }
}
`;

const LoginQuery = gql`
mutation Login($credential: LoginUserWithAuth0Input!) {
  loginUserWithAuth0(input: $credential) {
    user {
      id
      username
    }
  }
}
`;

const PublicChannelsQuery = gql`
query GetPublicChannels($wherePublic: ChannelWhereArgs, $orderBy: [ChannelOrderByArgs]) {
  viewer {
    allChannels(where: $wherePublic, orderBy: $orderBy) {
      edges {
        node {
          id
          name
          isPublic
        }
      }
    }
  }
}
`;

class Channels extends React.Component {

  constructor(props) {
    super(props);
    this.onAuthenticated = this.onAuthenticated.bind(this);
    this.startLogin = this.startLogin.bind(this);
    this.logout = this.logout.bind(this);
    this.auth = new AuthService(config.auth0ClientId, config.auth0Domain);
    this.auth.on('authenticated', this.onAuthenticated);
    this.auth.on('error', console.log);
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  componentDidMount() {
    this.subscription = this.props.data.subscribeToMore({
      document: gql`
        subscription newChannels($subscriptionFilter:ChannelSubscriptionFilter) {
          subscribeToChannel(mutations:[createChannel], filter: $subscriptionFilter) {
            edge {
              node {
                id
                name
                createdAt
              }
            }
          }
        }
      `,
      variables: {
        subscriptionFilter: {
          isPublic: {
            eq: true
          }
        }
      },
      updateQuery: (prev, { subscriptionData }) => {
        debugger;
        return {
          viewer: {
            allChannels: {
              edges: [
                ...prev.viewer.allChannels.edges,
                subscriptionData.data.subscribeToChannel.edge
              ]
            }
          }
        };
      },
    });
  }

  onAuthenticated(auth0Profile, tokenPayload) {
    const that = this;
    this.props.loginUser({
      idToken: tokenPayload.idToken,
    }).then(res => {
      const scapholdUserId = res.data.loginUserWithAuth0.user.id;
      const profilePicture = auth0Profile.picture;
      const nickname = auth0Profile.nickname;
      return that.props.updateUser({
        id: scapholdUserId,
        picture: profilePicture,
        nickname: nickname
      });

      // Cause a UI update :)
      this.setState({});
    }).catch(err => {
      console.log(`Error updating user: ${err.message}`);
    });
  }

  logout() {
    this.auth.logout()
    this.setState({});
  }

  startLogin() {
    this.auth.login();
  }

  render() {
    const profile = this.auth.getProfile();
    return (
      <div>
        <h3>
          Channels
          <a href="https://scaphold.io">
            <img
              style={{ float: 'right', width: '30px', height: '30px' }}
              target="_blank"
              src="https://scaphold.io/5d9897e87a7c597b0589f95cde19ad9d.png">
            </img>
          </a>
        </h3>
        {
          this.props.data.viewer ?
            <ul>
              {
                this.props.data.viewer.allChannels.edges.map(edge => (
                  <li key={edge.node.id}><Link to={`/channels/${edge.node.id}`}>{edge.node.name}</Link></li>
                ))
              }
            </ul> : null
        }
        <Link to="/createChannel" style={{ color: 'white' }}>Create channel</Link>
        {
          !this.auth.loggedIn() ?
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '15px', textAlign: 'center'}}>
              <Link onClick={this.startLogin} style={{ color: 'white' }}>Login</Link>
            </div> :
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '15px', textAlign: 'center'}}>
              <div style={{ marginBottom: '5px' }}>
                {profile ? profile.nickname : ''}
              </div>
              {
                profile ?
                  <div>
                    <img src={profile.picture} style={{ marginBottom: '5px', width: '40px', height: '40px', borderRadius: '20px' }}/>
                  </div> :
                  null
              }
              <div onClick={this.logout}>Logout</div>
            </div>
        }
      </div>
    )
  }
}

const ChannelsWithData = compose(
  graphql(PublicChannelsQuery, {
    options: (props) => {
      return {
        variables: {
          wherePublic: {
            isPublic: {
              eq: true,
            }
          },
          orderBy: [
            {
              field: 'name',
              direction: 'ASC'
            }
          ]
        },
      };
    },
  }),
  graphql(LoginQuery, {
    props: ({ mutate }) => ({
      loginUser: (credential) => mutate({ variables: { credential: credential }}),
    })
  }),
  graphql(UpdateUserQuery, {
    props: ({ mutate }) => ({
      updateUser: (user) => mutate({ variables: { user: user }}),
    })
  })
)(Channels);

export default ChannelsWithData;

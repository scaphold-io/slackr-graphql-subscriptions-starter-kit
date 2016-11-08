import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './index.scss';
import React from 'react';
import { Link, browserHistory } from 'react-router';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

class CreateChannel extends React.Component {
  constructor(props) {
    super(props);
    this.createChannel = this.createChannel.bind(this);
    this.onChannelNameChange = this.onChannelNameChange.bind(this);
    this.onIsPublicChanged = this.onIsPublicChanged.bind(this);
    this.state = {
      channel: {
        name: '',
        isPublic: false,
      },
    };
  }

  onChannelNameChange(e) {
    this.setState({
      channel: {
        isPublic: this.state.channel.isPublic,
        name: e.target.value,
      },
    });
  }

  onIsPublicChanged(e) {
    this.setState({
      channel: {
        name: this.state.channel.name,
        isPublic: e.target.checked,
      },
    });
  }

  createChannel() {
    const that = this;
    this.props.createChannel(this.state.channel).then(({ data: { createChannel: { changedChannel } } }) => {
      that.setState({
        channel: {
          name: '',
          isPublic: false,
        },
      });
      browserHistory.push(`/channels/${changedChannel.id}`);
    });
  }

  render() {
    return (
      <div>
        <h1>New Channel</h1>
        <div className="input-group">
          <span className="input-group-addon">
            <span style={{ marginRight: '5px' }}>Public?</span>
            <input onChange={this.onIsPublicChanged} type="checkbox" aria-label="Is Channel Public" />
          </span>
          <input onChange={this.onChannelNameChange} type="text" placeholder="Channel Name" className="form-control" aria-label="Channel Name" />
          <span className="input-group-btn">
            <button className="btn btn-info" type="button" onClick={this.createChannel}>Create</button>
          </span>
        </div>
      </div>
    )
  }
}

const CreateChannelQuery = gql`
mutation CreateChannel($channel: CreateChannelInput!) {
  createChannel(input: $channel) {
    changedChannel {
      id
      name
      createdAt
    }
  }
}
`;

export default graphql(CreateChannelQuery, {
  props: ({ mutate }) => ({
    createChannel: (channel) => mutate({ variables: { channel: channel }})
  })
})(CreateChannel);

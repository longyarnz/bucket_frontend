import React, { Component, Fragment } from 'react';
import AccessTab from './components/AccessTab';
import Bucket from './components/Bucket';
import Renamer from './components/Renamer';
import BucketList from './components/BucketList';
import ShouldRender from './components/ShouldRender';

/**
 * @class App
 * @extends ReactComponent
 * @description Main component of the game. It holds the state of the game.
 */
export default class App extends Component {
  constructor(props) {
    super(props)

    /**
     * @description Class methods that are accessible by children components.
     */
    this.actions = {
      setAppState: this.letChildrenSetState.bind(this),
      logout: this.Logout.bind(this)
    }

    /**
     * @description State of the app.
     */
    this.snapshot = {
      token: false,
      isUserLoggedIn: false,
      showAccess: true,
      showBucket: false,
      showRenamer: false,
      showBucketList: false,
      buckets: [],
      loadedBucket: {},
      defaultLimit: 20,
      searching: false
    }

    this.state = this.snapshot;
  }

  componentDidCatch(error, info) {
    console.log(error, info)
  }

  /**
   * @method letChildrenSetState
   * @param {{}} newState 
   * @description lets children component set the state of the App component.
   */
  letChildrenSetState(newState) {
    this.setState(newState);
  }

  Logout() {
    const url = `${process.env.REACT_APP_BASE_URL}/auth/logout`;
    fetch(url, {
      method: 'GET',
      headers: {
        authorization: this.state.token
      }
    }).then(res => res.json()).then(
      isUserLoggedOut => {
        isUserLoggedOut && this.setState(this.snapshot);
      }
    );
  }

  render() {
    return (
      <Fragment>
        <ShouldRender if={this.state.showAccess}>
          <AccessTab actions={this.actions} data={this.state} />
        </ShouldRender>
        <ShouldRender if={this.state.showBucketList}>
          <BucketList actions={this.actions} data={this.state} />
        </ShouldRender>
        <ShouldRender if={this.state.showBucket}>
          <Bucket actions={this.actions} data={this.state} />
        </ShouldRender>
        <ShouldRender if={this.state.showRenamer}>
          <Renamer actions={this.actions} data={this.state} />
        </ShouldRender>
      </Fragment>
    )
  }
}
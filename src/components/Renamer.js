import React, { PureComponent } from 'react';

export default class Renamer extends PureComponent {
  constructor(props) {
    super(props)
    this.Back = this.Back.bind(this);
    this.Jumbotron = this.Jumbotron.bind(this);
    this.renameBucket = this.renameBucket.bind(this);
    this.renameItem = this.renameItem.bind(this);
    this.state = {
      text: this.props.data.renameTitle
    }
  }

  renameBucket() {
    const url = `${window.location.href}api/v1/bucketlists/${this.props.data.renameId}`;
    this.setState({ loading: true });
    fetch(url, {
      method: 'PUT',
      headers: {
        authorization: this.props.data.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: this.state.text })
    }).then(res => res.json()).then(newBucket => {
      this.setState({ loading: false });
      newBucket._id && this.props.actions.setAppState(state => {
        const buckets = state.buckets;
        const index = state.buckets.findIndex(bucket => bucket._id === state.loadedBucket._id);
        buckets[index] = newBucket;
        return { buckets, showRenamer: false, [this.props.data.renameLink]: true }
      });
    });
  }

  renameItem() {
    const url = `${window.location.href}api/v1/bucketlists/${this.props.data.loadedBucket._id}/items/${this.props.data.renameId}`;
    this.setState({ loading: true });
    fetch(url, {
      method: 'PUT',
      headers: {
        authorization: this.props.data.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: this.state.text })
    }).then(res => res.json()).then(newItem => {
      this.setState({ loading: false });
      newItem._id && this.props.actions.setAppState(state => {
        const buckets = state.buckets;
        const loadedBucket = state.loadedBucket;
        let index = loadedBucket.items.findIndex(item => item._id === this.props.data.renameId);
        loadedBucket.items[index] = newItem;
        index = state.buckets.findIndex(bucket => bucket._id === loadedBucket._id);
        buckets[index] = loadedBucket;
        return { buckets, loadedBucket, showRenamer: false, [this.props.data.renameLink]: true }
      });
    });
  }

  Jumbotron(props) {
    const onChange = e => this.setState({ text: e.target.value });
    const type = this.props.data.renameType;
    return (
      <div className='jumbotron'>
        <input
          type='text'
          placeholder={this.props.data.renamePlaceholder}
          onChange={onChange}
          value={this.state.text}
        />
        <button onClick={type  === 'Bucket' ? this.renameBucket : this.renameItem} className='shadowed'>
          Rename
        </button>
      </div>
    )
  }

  Back() {
    this.props.actions.setAppState({
      showRenamer: false,
      [this.props.data.renameLink]: true
    });
  }

  render() {
    const { Jumbotron } = this;
    return (
      <section className='bucketlist'>
        <h1>Rename "{this.props.data.renameTitle}"</h1>
        <div className='message'>{this.state.loading && 'Connecting to server...'}</div>
        <Jumbotron />
        <footer>
          <span onClick={this.Back}>
            Back to {this.props.data.renameType} list
          </span>
          <span onClick={this.props.actions.logout}>
            Log Out
          </span>
        </footer>
      </section>
    )
  }
}

import React, { PureComponent } from 'react';

export default class Item extends PureComponent {
  constructor(props) {
    super(props)
    this.Back = this.Back.bind(this);
    this.Itemlist = this.Itemlist.bind(this);
    this.Jumbotron = this.Jumbotron.bind(this);
    this.JumboList = this.JumboList.bind(this);
    this.renameItem = this.renameItem.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.createNewItem = this.createNewItem.bind(this);
    this.state = {
      text: ''
    }
  }

  renameItem(name, id) {
    this.props.actions.setAppState({
      renameLink: 'showBucket',
      renameType: 'Item',
      renameId: id,
      renamePlaceholder: 'Rename Item',
      renameTitle: name,
      showBucket: false,
      showRenamer: true
    })
  }

  deleteItem(itemId) {
    this.setState({ loading: true });
    const loadedBucket = this.props.data.loadedBucket;
    const url = `${process.env.REACT_APP_BASE_URL}/bucketlists/${loadedBucket._id}/items/${itemId}`;
    fetch(url, {
      method: 'DELETE',
      headers: {
        authorization: this.props.data.token
      }
    }).then(res => res.json()).then(isDeleted => {
      isDeleted && this.props.actions.setAppState(state => {
        this.setState({ loading: false });
        const buckets = state.buckets;
        loadedBucket.items = loadedBucket.items.filter(item => item._id !== itemId);
        const index = state.buckets.findIndex(bucket => bucket._id === loadedBucket._id);
        buckets[index] = loadedBucket;
        return { buckets, loadedBucket }
      });
    });
  }

  createNewItem() {
    if(this.state.text === '') return;
    const bucketId = this.props.data.loadedBucket._id;
    const url = `${process.env.REACT_APP_BASE_URL}/bucketlists/${bucketId}/items/`;
    const name = { name: this.state.text };
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(name),
      headers: {
        'Content-Type': 'application/json',
        authorization: this.props.data.token
      }
    }).then(res => res.json()).then(
      newItem => {
        this.setState({ text: '', loading: false });
        newItem._id && this.props.actions.setAppState(state => {
          const buckets = state.buckets;
          const loadedBucket = state.loadedBucket;
          loadedBucket.items = loadedBucket.items.concat([newItem]);
          const index = state.buckets.findIndex(bucket => bucket._id === bucketId);
          buckets[index] = loadedBucket;
          return { buckets, loadedBucket }
        });
      }
    );
  }

  markAsComplete(name, id){
    if(this.state.loading) return;
    const url = `${process.env.REACT_APP_BASE_URL}/bucketlists/${this.props.data.loadedBucket._id}/items/${id}`;
    this.setState({ loading: true });
    fetch(url, {
      method: 'PUT',
      headers: {
        authorization: this.props.data.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, done: true })
    }).then(res => res.json()).then(newItem => {
      this.setState({ loading: false });
      newItem._id && this.props.actions.setAppState(state => {
        const buckets = state.buckets;
        const loadedBucket = state.loadedBucket;
        let index = loadedBucket.items.findIndex(item => item._id === id);
        loadedBucket.items[index] = newItem;
        index = state.buckets.findIndex(bucket => bucket._id === loadedBucket._id);
        buckets[index] = loadedBucket;
        return { buckets, loadedBucket }
      });
    });
  }

  Itemlist(props) {
    const onClick = () => !props.status && this.markAsComplete(props.name, props.id);
    const deleteItem = () => this.deleteItem(props.id);
    const renameItem = () => this.renameItem(props.name, props.id);
    return (
      <div>
        <button onClick={onClick} title='Click to mark as COMPLETED' className={props.status && 'green'}>
          {props.name}
          <i className='material-icons' onClick={renameItem}>
            {props.status ? 'assignment_turned_in' : 'assignment'}
        </i>
        </button>
        <i className='material-icons' onClick={renameItem}>
          edit
        </i>
        <i className='material-icons' onClick={deleteItem}>
          delete
        </i>
      </div>
    )
  }

  Jumbotron(props) {
    const onChange = e => this.setState({ text: e.target.value });
    return (
      <div className='jumbotron'>
        <input
          type='text'
          placeholder='Add an item'
          onChange={onChange}
          value={this.state.text}
        />
        <button onClick={this.createNewItem}>
          Add
        </button>
      </div>
    )
  }

  JumboList(props) {
    const { Itemlist } = this;
    return (
      <div className='jumbolist'>
        {
          this.props.data.loadedBucket.items.map(item => (
            <Itemlist name={item.name} status={item.done} id={item._id} key={item._id} />
          ))
        }
      </div>
    )
  }

  Back() {
    this.props.actions.setAppState({
      showBucket: false,
      showBucketList: true,
      loadedBucket: {}
    });
  }

  render() {
    const { Jumbotron, JumboList } = this;
    return (
      <section className='bucketlist'>
        <h1>{this.props.data.loadedBucket.name}</h1>
        <div className='message'>{this.state.loading && 'Connecting to server...'}</div>
        <Jumbotron />
        <JumboList />
        <footer>
          <span onClick={this.Back}>
            Back to Bucketlists
          </span>
          <span onClick={this.props.actions.logout}>
            Log Out
          </span>
        </footer>
      </section>
    )
  }
}
import React, { PureComponent } from 'react';

export default class BucketList extends PureComponent {
  constructor(props) {
    super(props)
    this.Search = this.Search.bind(this);
    this.LoadMore = this.LoadMore.bind(this);
    this.Jumbotron = this.Jumbotron.bind(this);
    this.JumboList = this.JumboList.bind(this);
    this.Bucketlist = this.Bucketlist.bind(this);
    this.renameBucket = this.renameBucket.bind(this);
    this.deleteBucket = this.deleteBucket.bind(this);
    this.createNewBucket = this.createNewBucket.bind(this);
    this.state = {
      text: '', page: 1, more: true
    }
  }

  static getDerivedStateFromProps(props) {
    const { length } = props.data.buckets;
    const page = Math.floor(length / props.data.defaultLimit) + 1;
    return { page };
  }

  componentDidMount(endpoint = '/', responseHandler) {
    if(this.props.data.searching) return;
    const url = `${window.location.href}api/v1/bucketlists${endpoint}`;
    this.setState({ loading: true });
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: this.props.data.token
      }
    }).then(res => res.json()).then(
      buckets => {
        this.setState({ loading: false });
        Array.isArray(buckets) && buckets.length < this.props.data.defaultLimit && this.setState({ more: false });
        if(responseHandler){
          responseHandler(buckets);
        }
        else{
          Array.isArray(buckets) && buckets.length > 0 && this.props.actions.setAppState({ buckets });
        }
      }
    );
  }

  Search(){
    if(this.props.data.searching){
      this.props.actions.setAppState(state => ({ cache: [], buckets: state.cache, searching: !state.searching }));
    }
    else{
      this.props.actions.setAppState(state => ({ cache: state.buckets, buckets: [], searching: !state.searching }));
    }
  }

  LoadMore() {
    if (!this.state.more) return;
    const responseHandler = buckets => Array.isArray(buckets) && buckets.length > 0 && this.props.actions.setAppState(
      state => ({buckets: state.buckets.concat(buckets)})
    );
    this.componentDidMount(`?page=${this.state.page}`, responseHandler);
  }

  renameBucket(name, id) {
    this.props.actions.setAppState({
      renameLink: 'showBucketList',
      renameType: 'Bucket',
      renameId: id,
      renamePlaceholder: 'Rename Bucket',
      renameTitle: name,
      showBucketList: false,
      showRenamer: true
    })
  }

  deleteBucket(bucketId) {
    const url = `${window.location.href}api/v1/bucketlists/${bucketId}`;
    this.setState({ loading: true });
    fetch(url, {
      method: 'DELETE',
      headers: {
        authorization: this.props.data.token
      }
    }).then(res => res.json()).then(isDeleted => {
      this.setState({ loading: false });
      isDeleted && this.props.actions.setAppState(state => ({
        buckets: state.buckets.filter(bucket => bucket._id !== bucketId)
      }));
    });
  }

  createNewBucket() {
    if (this.state.text === '') return;
    this.setState({ loading: true });
    const name = { name: this.state.text };
    const url = `${window.location.href}api/v1/bucketlists${this.props.data.searching ? `?q=${name.name}` : ''}`;
    fetch(url, {
      method: this.props.data.searching ? 'GET' : 'POST',
      body: this.props.data.searching ? null : JSON.stringify(name),
      headers: {
        'Content-Type': 'application/json',
        authorization: this.props.data.token
      }
    }).then(res => res.json()).then(
      newBucket => {
        this.setState({ loading: false, text: '' });
        newBucket._id && this.props.actions.setAppState(state => {
          const buckets = state.buckets.concat([newBucket]);
          return { buckets }
        });
        Array.isArray(newBucket) && this.props.actions.setAppState(state => {
          const buckets = state.buckets.concat(newBucket);
          return { buckets }
        });
      }
    );
  }

  Bucketlist(props) {
    const bucket = this.props.data.buckets.find(bucket => bucket._id === props.id);
    const onClick = () => this.props.actions.setAppState({
      loadedBucket: bucket, showBucket: true, showBucketList: false
    });
    const deleteBucket = () => this.deleteBucket(props.id);
    const renameBucket = () => this.renameBucket(props.name, props.id);
    return (
      <div>
        <button onClick={onClick}>
          {props.name}
          <span>{bucket.items.length}</span>
        </button>
        <i className='material-icons' onClick={renameBucket}>
          edit
        </i>
        <i className='material-icons' onClick={deleteBucket}>
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
          placeholder='Name of bucketlist'
          onChange={onChange}
          value={this.state.text}
        />
        <button onClick={this.createNewBucket} className='shadowed'>
          {this.props.data.searching ? 'Search Bucketlists' : 'Create a Bucketlist'}
        </button>
      </div>
    )
  }

  JumboList(props) {
    const { Bucketlist } = this;
    return (
      <div className='jumbolist'>
        {
          this.props.data.buckets.map(bucket => (
            <Bucketlist name={bucket.name} id={bucket._id} key={bucket._id} />
          ))
        }
      </div>
    )
  }

  render() {
    const { Jumbotron, JumboList, LoadMore, Search } = this;
    return (
      <section className='bucketlist'>
        <h1>Bucketlists</h1>
        <div className='message'>{this.state.loading && 'Connecting to server...'}</div>
        <Jumbotron />
        <JumboList />
        <footer>
          <span onClick={this.props.actions.logout}>
            Log Out
          </span>
          <span onClick={LoadMore} className={!this.state.more ? 'no-hover' : ''}>
            Load More
          </span>
          <span onClick={Search}>
            {this.props.data.searching ? 'Cancel Search' : 'Search'}
          </span>
        </footer>
      </section>
    )
  }
}

import React, { PureComponent } from 'react';

/**
 * @class AccessTab
 * @extends React.Component
 * @description Settings component of the game. It holds the methods that start and restart of the game.
 */
export default class AccessTab extends PureComponent {
  constructor(props) {
    super(props)
    this.submitForm = this.submitForm.bind(this);
    this.Footer = this.Footer.bind(this);
    this.state = {
      isFormSubmitting: false,
      endpoint: 'login',
      message: '',
      buckets: []
    }
  }

  /**
   * @method InputBox
   * @description React component for form input
   * @param {React.Props} props 
   * @return {JSX.Element} A JSX element for HTML form input.
   */
  InputBox(props) {
    const { placeholder, disabled, type = 'text' } = props;
    return (
      <input
        type={type}
        placeholder={placeholder}
        required
        disabled={disabled}
      />
    )
  }

  Footer(props) {
    if (this.state.endpoint === 'create') {
      return (
        <footer>
          Already have an account?
          <span onClick={() => this.setState({ endpoint: 'login' })}>
            Log in
          </span>
        </footer>
      )
    }
    else {
      return (
        <footer>
          Do not have an account?
          <span onClick={() => this.setState({ endpoint: 'create' })}>
            Create an account
          </span>
        </footer>
      )
    }
  }

  submitForm(e) {
    e.preventDefault();
    this.setState({
      isFormSubmitting: true,
      message: ''
    });
    const data = {
      username: e.target[0].value,
      password: e.target[1].value
    }
    const url = `${process.env.REACT_APP_BASE_URL}/auth/${this.state.endpoint}`
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => res.json()).then(
      message => {
        if (!message.token) this.setState({ isFormSubmitting: false, message: message.text })
        else {
          this.props.actions.setAppState({
            token: message.token, isUserLoggedIn: true, showAccess: false, showBucketList: true
          });
        }
      }
    );
  }

  render() {
    const { InputBox, Footer, state: { isFormSubmitting, endpoint, message } } = this;
    const header = endpoint === 'create' ? 'Create a new Account' : 'Log In';
    return (
      <section className='access-tab'>
        <form onSubmit={this.submitForm}>
          <h1>{header}</h1>
          <div className='red'>{message}</div>
          <InputBox
            placeholder="Username"
            disabled={isFormSubmitting}
          />
          <InputBox
            type="password"
            placeholder="Password"
            disabled={isFormSubmitting}
          />
          <div>
            <button
              type="submit"
              disabled={isFormSubmitting}
            >
              Submit
            </button>
          </div>
        </form>
        <Footer />
      </section>
    )
  }
}
/**
 * Toolbar component.
 * @module components/manage/Toolbar/Toolbar
 */

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import cookie from 'react-cookie';
import { find } from 'lodash';

import { getActions } from '../../../actions';

import { Icon } from '../../../components';
import pastanagaSmall from './pastanaga-small.svg';
import pastanagalogo from './pastanaga.svg';
import { getBaseUrl } from '../../../helpers';

import penSVG from '../../../icons/pen.svg';
import folderSVG from '../../../icons/folder.svg';
import addSVG from '../../../icons/add-document.svg';
import moreSVG from '../../../icons/more.svg';
import userSVG from '../../../icons/user.svg';

@connect(
  (state, props) => ({
    actions: state.actions.actions,
    token: state.userSession.token,
    content: state.content.data,
    pathname: props.pathname,
  }),
  { getActions },
)
/**
 * Toolbar container class.
 * @class Toolbar
 * @extends Component
 */
class Toolbar extends Component {
  /**
   * Property types.
   * @property {Object} propTypes Property types.
   * @static
   */
  static propTypes = {
    actions: PropTypes.shape({
      object: PropTypes.arrayOf(PropTypes.object),
      object_buttons: PropTypes.arrayOf(PropTypes.object),
      user: PropTypes.arrayOf(PropTypes.object),
    }),
    token: PropTypes.string,
    pathname: PropTypes.string.isRequired,
    content: PropTypes.shape({
      '@type': PropTypes.string,
      is_folderish: PropTypes.bool,
      review_state: PropTypes.string,
    }),
    getActions: PropTypes.func.isRequired,
    inner: PropTypes.element.isRequired,
    hideDefaultViewButtons: PropTypes.bool,
  };

  /**
   * Default properties.
   * @property {Object} defaultProps Default properties.
   * @static
   */
  static defaultProps = {
    actions: null,
    token: null,
    content: null,
    hideDefaultViewButtons: false,
  };

  state = {
    expanded: cookie.load('toolbar_expanded') !== 'false',
    showMenu: false,
    menuStyle: {},
    menuComponents: [],
  };

  /**
   * Component will mount
   * @method componentDidMount
   * @returns {undefined}
   */
  componentDidMount() {
    this.props.getActions(this.props.pathname);
  }

  /**
   * Component will receive props
   * @method componentWillReceiveProps
   * @param {Object} nextProps Next properties
   * @returns {undefined}
   */
  componentWillReceiveProps(nextProps) {
    if (nextProps.pathname !== this.props.pathname) {
      this.props.getActions(nextProps.pathname);
    }

    // if (nextProps.actions.object_buttons) {
    //   const objectButtons = nextProps.actions.object_buttons;
    //   this.setState({
    //     hasObjectButtons: !!objectButtons.length,
    //   });
    // }
  }

  handleShrink = () => {
    cookie.save('toolbar_expanded', !this.state.expanded, {
      expires: new Date((2 ** 31 - 1) * 1000),
      path: '/',
    });
    this.setState(state => ({ expanded: !state.expanded }));
  };

  closeMenu = () =>
    this.setState(() => ({ showMenu: false, menuComponents: [] }));

  loadComponent = type => {
    const { menuComponents } = this.state;
    const nextIndex = menuComponents.length;

    if (
      !this.state.menuComponents.reduce(
        (prev, current) => prev && current.name === `${type}`,
        false,
      )
    ) {
      import(`./${type}.jsx`).then(LoadedComponent =>
        this.setState(state => ({
          menuComponents: state.menuComponents.concat({
            name: `${type}`,
            component: (
              <LoadedComponent.default
                pathname={this.props.pathname}
                loadComponent={this.loadComponent}
                unloadComponent={this.unloadComponent}
                componentIndex={nextIndex}
                theToolbar={this.theToolbar}
                key={`menucomp-${nextIndex}`}
              />
            ),
          }),
        })),
      );
    }
  };

  unloadComponent = () => {
    this.setState(state => ({
      menuComponents: state.menuComponents.slice(0, -1),
    }));
  };

  toggleMenu = (e, selector) => {
    if (this.state.showMenu) {
      this.closeMenu();
      return;
    }
    // PersonalTools always shows at bottom
    if (selector === 'PersonalTools') {
      this.setState(state => ({
        showMenu: !state.showMenu,
        menuStyle: { bottom: 0 },
      }));
    } else {
      const elemOffsetTop = e.target.getBoundingClientRect().top;
      this.setState(state => ({
        showMenu: !state.showMenu,
        menuStyle: { top: `${elemOffsetTop}px` },
      }));
    }
    this.loadComponent(selector);
  };

  /**
   * Render method.
   * @method render
   * @returns {string} Markup for the component.
   */
  render() {
    const path = getBaseUrl(this.props.pathname);
    const editAction = find(this.props.actions.object, { id: 'edit' });
    const folderContentsAction = find(this.props.actions.object, {
      id: 'folderContents',
    });

    return (
      this.props.token && (
        <Fragment>
          <div
            style={this.state.menuStyle}
            className={
              this.state.showMenu ? 'toolbar-content show' : 'toolbar-content'
            }
            ref={toolbar => {
              this.theToolbar = toolbar;
            }}
          >
            <div
              className="pusher-puller"
              style={{
                left: `-${(this.state.menuComponents.length - 1) * 100}%`,
              }}
            >
              {this.state.menuComponents.map(component => (
                <Fragment key={component.name}>{component.component}</Fragment>
              ))}
            </div>
          </div>
          <div className={this.state.expanded ? 'toolbar expanded' : 'toolbar'}>
            <div className="toolbar-body">
              <div className="toolbar-actions">
                {this.props.hideDefaultViewButtons &&
                  this.props.inner && <Fragment>{this.props.inner}</Fragment>}
                {!this.props.hideDefaultViewButtons && (
                  <Fragment>
                    {editAction && (
                      <Link className="edit" to={`${path}/edit`}>
                        <Icon name={penSVG} size="36px" className="circled" />
                      </Link>
                    )}
                    {this.props.content &&
                      this.props.content.is_folderish &&
                      folderContentsAction && (
                        <Link to="/contents">
                          <Icon name={folderSVG} size="36px" />
                        </Link>
                      )}
                    {this.props.content &&
                      this.props.content.is_folderish && (
                        <Link to="/add?type=document">
                          <Icon name={addSVG} size="36px" />
                        </Link>
                      )}
                    <button
                      className="more"
                      onClick={e => this.toggleMenu(e, 'More')}
                      tabIndex={0}
                    >
                      <Icon name={moreSVG} size="36px" />
                    </button>
                  </Fragment>
                )}
              </div>
              <div className="toolbar-bottom">
                <img className="minipastanaga" src={pastanagaSmall} alt="" />
                {!this.props.hideDefaultViewButtons && (
                  <button
                    className="user"
                    onClick={e => this.toggleMenu(e, 'PersonalTools')}
                    tabIndex={0}
                  >
                    <Icon name={userSVG} size="36px" />
                  </button>
                )}
                <div className="divider" />
                <div className="pastanagalogo">
                  <img src={pastanagalogo} alt="" />
                </div>
              </div>
            </div>
            <div className="toolbar-handler">
              <button onClick={this.handleShrink} />
            </div>
          </div>
          <div className="pusher" />
        </Fragment>
      )
    );
  }
}

export default Toolbar;

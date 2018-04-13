/**
 * Add container.
 * @module components/manage/Add/Add
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import { asyncConnect } from 'redux-connect';
import { isEmpty, pick } from 'lodash';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { Portal } from 'react-portal';

import saveSVG from '../../../icons/save.svg';
import clearSVG from '../../../icons/clear.svg';
import { addContent, getSchema } from '../../../actions';
import { Form, Icon, Toolbar } from '../../../components';
import config from '../../../config';
import { getBaseUrl } from '../../../helpers';

const messages = defineMessages({
  add: {
    id: 'Add {type}',
    defaultMessage: 'Add {type}',
  },
  save: {
    id: 'Save',
    defaultMessage: 'Save',
  },
  cancel: {
    id: 'Cancel',
    defaultMessage: 'Cancel',
  },
});

@injectIntl
@connect(
  (state, props) => ({
    request: state.content.add,
    content: state.content.data,
    schema: state.schema.schema,
    pathname: props.location.pathname,
    returnUrl: props.location.query.return_url,
    type: props.location.query.type,
  }),
  dispatch => bindActionCreators({ addContent, getSchema }, dispatch),
)
/**
 * AddComponent class.
 * @class AddComponent
 * @extends Component
 */
export class AddComponent extends Component {
  /**
   * Property types.
   * @property {Object} propTypes Property types.
   * @static
   */
  static propTypes = {
    addContent: PropTypes.func.isRequired,
    getSchema: PropTypes.func.isRequired,
    pathname: PropTypes.string.isRequired,
    schema: PropTypes.objectOf(PropTypes.any),
    content: PropTypes.shape({
      // eslint-disable-line react/no-unused-prop-types
      '@id': PropTypes.string,
    }),
    returnUrl: PropTypes.string,
    request: PropTypes.shape({
      loading: PropTypes.bool,
      loaded: PropTypes.bool,
    }).isRequired,
    type: PropTypes.string,
    intl: intlShape.isRequired,
  };

  /**
   * Default properties
   * @property {Object} defaultProps Default properties.
   * @static
   */
  static defaultProps = {
    schema: null,
    content: null,
    returnUrl: null,
    type: 'Default',
  };

  /**
   * Constructor
   * @method constructor
   * @param {Object} props Component properties
   * @constructs WysiwygEditor
   */
  constructor(props) {
    super(props);
    this.onCancel = this.onCancel.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  /**
   * Component will mount
   * @method componentWillMount
   * @returns {undefined}
   */
  componentWillMount() {
    this.props.getSchema(this.props.type);
  }

  /**
   * Component will receive props
   * @method componentWillReceiveProps
   * @param {Object} nextProps Next properties
   * @returns {undefined}
   */
  componentWillReceiveProps(nextProps) {
    if (this.props.request.loading && nextProps.request.loaded) {
      browserHistory.push(
        this.props.returnUrl ||
          nextProps.content['@id'].replace(config.apiPath, ''),
      );
    }
  }

  /**
   * Submit handler
   * @method onSubmit
   * @param {object} data Form data.
   * @returns {undefined}
   */
  onSubmit(data) {
    this.props.addContent(getBaseUrl(this.props.pathname), {
      ...data,
      '@type': this.props.type,
    });
  }

  /**
   * Cancel handler
   * @method onCancel
   * @returns {undefined}
   */
  onCancel() {
    browserHistory.push(getBaseUrl(this.props.pathname));
  }

  /**
   * Render method.
   * @method render
   * @returns {string} Markup for the component.
   */
  render() {
    if (this.props.schema) {
      return (
        <div id="page-add">
          <Helmet
            title={this.props.intl.formatMessage(messages.add, {
              type: this.props.type,
            })}
          />
          <Form
            ref={instance => {
              if (instance) {
                this.form = instance.refs.wrappedInstance;
              }
            }}
            schema={this.props.schema}
            onSubmit={this.onSubmit}
            hideActions
            title={this.props.intl.formatMessage(messages.add, {
              type: this.props.type,
            })}
            loading={this.props.request.loading}
          />
          <Portal node={__CLIENT__ && document.getElementById('toolbar')}>
            <Toolbar
              pathname={this.props.pathname}
              hideDefaultViewButtons
              inner={
                <div>
                  <button className="save" onClick={() => this.form.onSubmit()}>
                    <Icon
                      name={saveSVG}
                      className="circled"
                      size="36px"
                      title={this.props.intl.formatMessage(messages.save)}
                    />
                  </button>
                  <button className="cancel" onClick={() => this.onCancel()}>
                    <Icon
                      name={clearSVG}
                      className="circled"
                      size="36px"
                      title={this.props.intl.formatMessage(messages.cancel)}
                    />
                  </button>
                </div>
              }
            />
          </Portal>
        </div>
      );
    }
    return <div />;
  }
}

export default asyncConnect([
  {
    key: 'schema',
    promise: ({ location, store: { dispatch } }) =>
      dispatch(getSchema(location.query.type)),
  },
  {
    key: 'content',
    promise: ({ location, store: { dispatch, getState } }) => {
      const { form } = getState();
      if (!isEmpty(form)) {
        return dispatch(
          addContent(getBaseUrl(location.pathname), {
            ...pick(form, ['title', 'description', 'text']),
            '@type': 'Document',
          }),
        );
      }
      return Promise.resolve(getState().content);
    },
  },
])(AddComponent);

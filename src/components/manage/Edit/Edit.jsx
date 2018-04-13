/**
 * Edit container.
 * @module components/manage/Edit/Edit
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
import showBlocksSVG from '../../../icons/show-blocks.svg';
import columnSVG from '../../../icons/column.svg';

import { Form, Icon, Toolbar } from '../../../components';
import { editContent, getContent, getSchema } from '../../../actions';
import { getBaseUrl } from '../../../helpers';

const messages = defineMessages({
  edit: {
    id: 'Edit {title}',
    defaultMessage: 'Edit {title}',
  },
  save: {
    id: 'Save',
    defaultMessage: 'Save',
  },
  cancel: {
    id: 'Cancel',
    defaultMessage: 'Cancel',
  },
  properties: {
    id: 'Properties',
    defaultMessage: 'Properties',
  },
  visual: {
    id: 'Visual',
    defaultMessage: 'Visual',
  },
});

@injectIntl
@connect(
  (state, props) => ({
    content: state.content.data,
    schema: state.schema.schema,
    getRequest: state.content.get,
    editRequest: state.content.edit,
    pathname: props.location.pathname,
    returnUrl: props.location.query.return_url,
  }),
  dispatch =>
    bindActionCreators(
      {
        editContent,
        getContent,
        getSchema,
      },
      dispatch,
    ),
)
/**
 * EditComponent class.
 * @class EditComponent
 * @extends Component
 */
export class EditComponent extends Component {
  /**
   * Property types.
   * @property {Object} propTypes Property types.
   * @static
   */
  static propTypes = {
    editContent: PropTypes.func.isRequired,
    getContent: PropTypes.func.isRequired,
    getSchema: PropTypes.func.isRequired,
    editRequest: PropTypes.shape({
      loading: PropTypes.bool,
      loaded: PropTypes.bool,
    }).isRequired,
    getRequest: PropTypes.shape({
      loading: PropTypes.bool,
      loaded: PropTypes.bool,
    }).isRequired,
    pathname: PropTypes.string.isRequired,
    returnUrl: PropTypes.string,
    content: PropTypes.shape({
      '@type': PropTypes.string,
    }),
    schema: PropTypes.objectOf(PropTypes.any),
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
  };

  /**
   * Constructor
   * @method constructor
   * @param {Object} props Component properties
   * @constructs WysiwygEditor
   */
  constructor(props) {
    super(props);
    this.state = {
      visual: false,
    };
    this.onCancel = this.onCancel.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onToggleVisual = this.onToggleVisual.bind(this);
  }

  /**
   * Component did mount
   * @method componentDidMount
   * @returns {undefined}
   */
  componentDidMount() {
    this.props.getContent(getBaseUrl(this.props.pathname));
  }

  /**
   * Component will receive props
   * @method componentWillReceiveProps
   * @param {Object} nextProps Next properties
   * @returns {undefined}
   */
  componentWillReceiveProps(nextProps) {
    if (this.props.getRequest.loading && nextProps.getRequest.loaded) {
      this.props.getSchema(nextProps.content['@type']);
    }
    if (this.props.editRequest.loading && nextProps.editRequest.loaded) {
      browserHistory.push(
        this.props.returnUrl || getBaseUrl(this.props.pathname),
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
    this.props.editContent(getBaseUrl(this.props.pathname), data);
  }

  /**
   * Cancel handler
   * @method onCancel
   * @returns {undefined}
   */
  onCancel() {
    browserHistory.push(
      this.props.returnUrl || getBaseUrl(this.props.pathname),
    );
  }

  /**
   * Toggle visual
   * @method onToggleVisual
   * @returns {undefined}
   */
  onToggleVisual() {
    this.setState({
      visual: !this.state.visual,
    });
  }

  /**
   * Render method.
   * @method render
   * @returns {string} Markup for the component.
   */
  render() {
    if (this.props.schema && this.props.content) {
      return (
        <div id="page-edit">
          <Helmet
            title={this.props.intl.formatMessage(messages.edit, {
              title: this.props.schema.title,
            })}
          />
          <Form
            ref={instance => {
              if (instance) {
                this.form = instance.refs.wrappedInstance;
              }
            }}
            schema={this.props.schema}
            formData={this.props.content}
            onSubmit={this.onSubmit}
            hideActions
            visual={this.state.visual}
            title={this.props.intl.formatMessage(messages.edit, {
              title: this.props.schema.title,
            })}
            loading={this.props.editRequest.loading}
            tiles={[
              {
                type: 'title',
              },
              {
                type: 'text',
                data: {
                  text: {
                    'content-type': 'text/html',
                    data:
                      '<h2>Some random header</h2><p>Some random text with <b>markup</b></p>',
                    encoding: 'utf8',
                  },
                },
              },
            ]}
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
                  <button
                    className="item"
                    onClick={() => this.onToggleVisual()}
                  >
                    <Icon
                      name={this.state.visual ? columnSVG : showBlocksSVG}
                      size="36px"
                      title={this.props.intl.formatMessage(
                        this.state.visual
                          ? messages.properties
                          : messages.visual,
                      )}
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
    promise: ({ store: { dispatch, getState } }) =>
      dispatch(getSchema(getState().content.data['@type'])),
  },
  {
    key: 'content',
    promise: ({ location, store: { dispatch, getState } }) => {
      const { form } = getState();
      if (!isEmpty(form)) {
        return dispatch(
          editContent(
            getBaseUrl(location.pathname),
            pick(form, ['title', 'description', 'text']),
          ),
        );
      }
      return Promise.resolve(getState().content);
    },
  },
])(EditComponent);

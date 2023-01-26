/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import Button from 'components/Button/Button.react';
import EmptyState from 'components/EmptyState/EmptyState.react';
import Field from 'components/Field/Field.react';
import FormModal from 'components/FormModal/FormModal.react';
import Icon from 'components/Icon/Icon.react';
import Label from 'components/Label/Label.react';
import Modal from 'components/Modal/Modal.react';
import React from 'react';
import SidebarAction from 'components/Sidebar/SidebarAction';
import subscribeTo from 'lib/subscribeTo';
import TableHeader from 'components/Table/TableHeader.react';
import TableView from 'dashboard/TableView.react';
import TextInput from 'components/TextInput/TextInput.react';
import Toolbar from 'components/Toolbar/Toolbar.react';
import { ActionTypes as SchemaActionTypes } from 'lib/stores/SchemaStore';
import { ActionTypes as PageActionTypes } from 'lib/stores/PageStore';
import styles from './Pages.scss';
import ParseCodeEditor from 'components/ParseCodeEditor/ParseCodeEditor.react';

const defaultState = {
  name: '',
  sourceCode: '',
};

const PAGE_URL = 'https://direct.bitcog.co/pages/';

export default
@subscribeTo('Pages', 'pages')
@subscribeTo('Schema', 'schema')
class Pages extends TableView {
  constructor() {
    super();
    this.section = 'Core';
    this.subsection = 'Pages';
    this.action = new SidebarAction(
      'Create a Page',
      this.openNewPageModal.bind(this)
    );
    this.state = {
      showNewPageModal: false,
      showEditPageModal: false,
      showDeletePageModal: false,
      currentObjectId: undefined,

      ...defaultState,
    };
  }

  componentWillMount() {
    this.props.pages.dispatch(PageActionTypes.FETCH);
    this.props.schema.dispatch(SchemaActionTypes.FETCH);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context !== nextContext) {
      nextProps.page.dispatch(PageActionTypes.FETCH);
      nextProps.schema.dispatch(SchemaActionTypes.FETCH);
    }
  }

  renderToolbar() {
    return (
      <Toolbar section="Integrations" subsection="Pages">
        <Button
          color="white"
          value="Create a Page"
          onClick={this.openNewPageModal.bind(this)}
        />
      </Toolbar>
    );
  }

  clearFields() {
    this.setState({
      ...defaultState,
    });
  }

  renderExtras() {
    const that = this;

    const pageModalFields = (      
      <div>
        <Field
          label={<Label text="Page Name" />}
          input={
            <TextInput
              placeholder="PageName"
              disabled={!this.state.showNewPageModal}
              onChange={(value) => {
                this.setState({ name: value });
              }}
              value={this.state.name}
            />
          }
        />
        <Field
          label={<Label text="Page URL" />}
          input={
            <TextInput
              placeholder="PageUrl"
              disabled={true}
              onChange={() => {}}
              value={PAGE_URL + this.state.name.toLowerCase()}
            />
          }
        />
        <div>
          <div className={styles.label}>Source Code</div>
          <ParseCodeEditor
            showConsole={false}
            code={this.state.sourceCode}
            setCompile={(func) => (that.compileCode = func)}
            isModal={true}
          />
        </div>
      </div>
    );

    const hookRequestData = ({
      sourceCode,
      name,
    }) => {
      return { content: sourceCode, name };
    };

    const newHookModal = (
      <FormModal
        key="new"
        title="Create a Page"
        icon="collaborate-outline"
        iconSize={30}
        open={this.state.showNewPageModal}
        onSubmit={async () => {
          this.setState({ sourceCode: await that.compileCode() });
          return this.props.pages.dispatch(
            PageActionTypes.CREATE,
            hookRequestData(this.state)
          );
        }}
        onClose={() => {
          this.setState({ showNewPageModal: false });
        }}
        submitText="Create"
        inProgressText={'Creating\u2026'}
        clearFields={this.clearFields.bind(this)}
        enabled={true /* TODO: do some validation here */}
      >
        {pageModalFields}
      </FormModal>
    );

    const editHookModal = (
      <FormModal
        key="edit"
        title="Change your Page"
        subtitle="Page on external servers can be edited here."
        open={this.state.showEditPageModal}
        onSubmit={async () => {
          this.setState({ sourceCode: await that.compileCode() });
          if (this.state.currentObjectId) {
            return this.props.pages.dispatch(PageActionTypes.EDIT, {
              ...hookRequestData(this.state),
              objectId: this.state.currentObjectId,
            });
          }
        }}
        onClose={() => {
          this.setState({
            showEditPageModal: false,
            currentObjectId: undefined,
          });
        }}
        submitText="Save"
        inProgressText={'Saving\u2026'}
        clearFields={this.clearFields.bind(this)}
        enabled={true /* TODO: do some validation here */}
      >
        {pageModalFields}
      </FormModal>
    );

    const deleteHookModal = (
      <FormModal
        key="delete"
        title="Delete your Page"
        subtitle="Page on external servers can be deleted here."
        open={this.state.showDeletePageModal}
        type={Modal.Types.DANGER}
        onSubmit={() => {
          if (this.state.currentObjectId)
            return this.props.pages.dispatch(PageActionTypes.DELETE, {
              objectId: this.state.currentObjectId,
            });
        }}
        onClose={() => {
          this.setState({
            showDeletePageModal: false,
            currentObjectId: undefined,
          });
        }}
        submitText="Delete"
        inProgressText={'Deleting\u2026'}
        clearFields={() => {
          this.setState({
            ...defaultState,
          });
        }}
        enabled={true /* TODO: do some validation here */}
      >
        {pageModalFields}
      </FormModal>
    );
    return [newHookModal, editHookModal, deleteHookModal];
  }

  renderRow(item) {
    const showEdit = () => {
      this.setState({
        name: item.name,
        sourceCode: item.code,
        showEditPageModal: true,
        currentObjectId: item.objectId,
      });
    };
    const showDelete = () => {
      this.setState({
        name: item.name,
        sourceCode: item.code,
        showDeletePageModal: true,
        currentObjectId: item.objectId,
      });
    };
    const rowStyle = { cursor: 'pointer' };
    return (
      <tr key={JSON.stringify(item)}>
        <td style={rowStyle} onClick={showEdit} width={'15%'}>
          {item.name}
        </td>
        <td style={rowStyle} onClick={showEdit} width={'45%'}>
          {PAGE_URL + item.name.toLowerCase() || ''}
        </td>
        <td style={rowStyle} onClick={showEdit} width={'30%'}>
          {item.code || ''}
        </td>
        <td width={'10%'}>
					<button type="button" onClick={showDelete} className={styles.deleteButton}>
						<Icon name="trash-outline" fill="#343445" width={20} height={20} />
					</button>
				</td>
      </tr>
    );
  }

  renderHeaders() {
    return [
      <TableHeader width={15} key="PageName">
        Page Name
      </TableHeader>,
      <TableHeader width={45} key="PageURL">
        Page URL
      </TableHeader>,
      <TableHeader width={30} key="SourceCode">
        Source Code
      </TableHeader>,
      <TableHeader width={10} key="Delete">
        &nbsp;
      </TableHeader>,
    ];
  }

  renderEmpty() {
    return (
      <EmptyState
        title="Pages"
        description={<span>...</span>}
        icon="gears"
        cta="Create a Page"
        action={this.openNewPageModal.bind(this)}
      />
    );
  }

  tableData() {
    if (this.props.pages.data) {
      let hooks = this.props.pages.data.get('page');
      if (hooks) {
        return hooks.toArray();
      }
    }
    return undefined;
  }

  openNewPageModal() {
    this.setState({ showNewPageModal: true });
  }
}

/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import keyMirror from 'lib/keyMirror';
import Parse from 'parse';
import { Map, List } from 'immutable';
import { registerStore } from 'lib/stores/StoreManager';
import notification from 'lib/notification';

export const ActionTypes = keyMirror(['FETCH', 'CREATE', 'EDIT', 'DELETE']);

const parseURL = 'classes/Deploy';

function normalifyData({
  name,
  collectionName,
  functionType,
  sourceCode,
}) {
  return {
    name: name || '',
    collectionName: collectionName || '',
    type: functionType || '',
    code: sourceCode || '',
  };
}

function DeployStore(state, action) {
  action.app.setParseKeys();
  switch (action.type) {
    case ActionTypes.FETCH:
      return Parse._request('GET', parseURL, {}, {}).then(({ results }) => {
        return Map({
          lastFetch: new Date(),
          deploy: List(results),
        });
      });
    case ActionTypes.CREATE:
      const newData = normalifyData(action);
      return Parse._request('POST', parseURL, newData, {
        useMasterKey: true,
      }).then(({ objectId }) => {
        if (objectId) {
          notification('success', 'Successfully Created!');
          return state.set('deploy', state.get('deploy').push({ ...newData, objectId }));
        }
        return state;
      });
    case ActionTypes.EDIT:
      if (action.objectId === undefined) return state;
      const updatedData = normalifyData(action);
      return Parse._request(
        'PUT',
        `${parseURL}/${action.objectId}`,
        updatedData,
        {
          useMasterKey: true,
        }
      ).then(({ updatedAt }) => {
        if (updatedAt) {
          notification('success', 'Successfully Updated!');
          const index = state
            .get('deploy')
            .findIndex((item) => item.objectId === action.objectId);
          return state.setIn(['deploy', index], { ...updatedData, objectId: action.objectId });
        }
        return state;
      });
    case ActionTypes.DELETE:
      if (action.objectId === undefined) return state;
      return Parse._request(
        'DELETE',
        `${parseURL}/${action.objectId}`,
        {},
        {
          useMasterKey: true,
        }
      ).then(({ error }) => {
        if (!error) {
          notification('success', 'Successfully Removed!');
          return state.set('deploy', state.get('deploy').filter((item) => !(item.objectId === action.objectId)));
        }
        return state;
      });
  }
}

registerStore('Deploy', DeployStore);

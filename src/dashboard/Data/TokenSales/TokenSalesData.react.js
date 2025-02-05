/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import React from "react";
import { CurrentApp } from "context/currentApp";
import { Outlet } from "react-router-dom";
import Parse from "parse";

export default class TokenSalesData extends React.Component {
  static contextType = CurrentApp;
  constructor() {
    super();

    this.state = {
      tokenSales: undefined,
    };
  }

  async fetchTokenSales() {
    const parentObjectQuery = new Parse.Query("MultiSaleCreated__e");
    const response = await parentObjectQuery.findAll({ useMasterKey: true });
    let result = [];
    response.forEach((parseObj) => {
      result.push(parseObj.toJSON());
    });
    this.setState({ tokenSales: result });
  }

  componentDidMount() {
    this.fetchTokenSales();
  }

  componentWillReceiveProps(props, context) {
    if (this.context !== context) {
      this.fetchTokenSales();
    }
  }

  render() {
    return (
      <Outlet
        context={{
          availableTokenSales: this.state.tokenSales,
        }}
      />
    );
  }
}

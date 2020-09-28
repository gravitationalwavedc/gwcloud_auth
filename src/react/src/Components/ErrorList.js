import React from "react";
import * as Enumerable from "linq";
import {List} from "semantic-ui-react";

const ErrorList = ({errors}) => {
  const listErrors = Enumerable.from(errors).select((e, i) => <List.Item key={i}>{e.message}</List.Item>).toArray();
  return (
    <List bulleted floated="left">
      {listErrors}
    </List>
  );
}

export default ErrorList;

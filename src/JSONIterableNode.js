import React from 'react';
import reactMixin from 'react-mixin';
import { ExpandedStateHandlerMixin } from './mixins';
import JSONArrow from './JSONArrow';
import grabNode from './grab-node';

const styles = {
  base: {
    position: 'relative',
    paddingTop: 3,
    paddingBottom: 3,
    paddingRight: 0,
    marginLeft: 14
  },
  label: {
    margin: 0,
    padding: 0,
    display: 'inline-block'
  },
  span: {
    cursor: 'default'
  },
  spanType: {
    marginLeft: 5,
    marginRight: 5
  }
};

@reactMixin.decorate(ExpandedStateHandlerMixin)
export default class JSONIterableNode extends React.Component {
  defaultProps = {
    data: [],
    initialExpanded: false
  };

  // flag to see if we still need to render our child nodes
  needsChildNodes = true;

  // cache store for our child nodes
  renderedChildren = [];

  // cache store for the number of items string we display
  itemString = false;

  constructor(props) {
    super(props);
    this.state = {
      expanded: this.props.initialExpanded,
      createdChildNodes: false
    };
  }

  // Returns the child nodes for each entry in iterable. If we have
  // generated them previously, we return from cache, otherwise we create
  // them.
  getChildNodes() {
    if (this.state.expanded && this.needsChildNodes) {
      let childNodes = [];
      let entries = Object.keys(this.props.data).sort();
      entries.forEach((entry) => {
        let key = null;
        let value = null;
        if (Array.isArray(entry)) {
          [key, value] = entry;
        } else {
          key = childNodes.length;
          value = entry;
        }

        let prevData;
        if (typeof this.props.previousData !== 'undefined' && this.props.previousData !== null) {
          prevData = this.props.previousData[key];
        }
        const node = grabNode(key, value, prevData, this.props.theme, this.props.styles, this.props.getItemString);
        if (node !== false) {
          childNodes.push(node);
        }
      });
      this.needsChildNodes = false;
      this.renderedChildren = childNodes;
    }
    return this.renderedChildren;
  }

  // Returns the "n entries" string for this node, generating and
  // caching it if it hasn't been created yet.
  getItemString(itemType) {
    if (!this.itemString) {
      const { data } = this.props;
      let count = 0;
      if (Number.isSafeInteger(data.size)) {
        count = data.size;
      } else {
        for (const entry of data) { // eslint-disable-line no-unused-vars
          count += 1;
        }
      }
      this.itemString = count + ' entr' + (count !== 1 ? 'ies' : 'y');
    }
    return this.props.getItemString('Iterable', this.props.data, itemType, this.itemString);
  }

  render() {
    const childNodes = this.getChildNodes();
    const childListStyle = {
      padding: 0,
      margin: 0,
      listStyle: 'none',
      display: (this.state.expanded) ? 'block' : 'none'
    };
    let containerStyle;
    let spanStyle = {
      ...styles.span,
      color: this.props.theme.base0E
    };
    containerStyle = {
      ...styles.base
    };
    if (this.state.expanded) {
      spanStyle = {
        ...spanStyle,
        color: this.props.theme.base03
      };
    }
    return (
      <li style={containerStyle}>
        <JSONArrow theme={this.props.theme} open={this.state.expanded} onClick={::this.handleClick} style={this.props.styles.getArrowStyle(this.state.expanded)} />
        <label style={{
          ...styles.label,
          color: this.props.theme.base0D,
          ...this.props.styles.getLabelStyle('Iterable', this.state.expanded)
        }} onClick={::this.handleClick}>
          {this.props.keyName}:
        </label>
        <span style={{
          ...spanStyle,
          ...this.props.styles.getItemStringStyle('Iterable', this.state.expanded)
        }} onClick={::this.handleClick}>
          {this.getItemString(<span style={styles.spanType}>()</span>)}
        </span>
        <ol style={{
          ...childListStyle,
          ...this.props.styles.getListStyle('Iterable', this.state.expanded)
        }}>
          {childNodes}
        </ol>
      </li>
    );
  }
}

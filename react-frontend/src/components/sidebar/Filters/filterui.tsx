import React, { Component } from "react";
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Select, { createFilter } from 'react-select';
import { FixedSizeList as List } from "react-window";

const height = 35;

interface Props {
    sendValuesUp: any
    g_options: { label: string; value: string; }[]
}

interface State {
    e_value: number
    show_unassigned: boolean
    g_searched: string[]
}

/**
 * Custom component to speed up searchbar / autocomplete with large datasets
 * Original idea by Tim Macdonald (https://github.com/tmacdonald)
 * published via CodeSandbox (=> https://codesandbox.io/s/lxv7omv65l)
 * as of 9th of October 2022
 */
class MenuList extends Component<any, any> {
    render() {
      const { options, children, maxHeight, getValue } = this.props;
      const [value] = getValue();
      const initialOffset = options.indexOf(value) * height;
  
      return (
        <List
          height={maxHeight}
          width={500}
          itemCount={children.length}
          itemSize={height}
          initialScrollOffset={initialOffset}
        >
          {({ index, style }: any) => <div style={style}>{children[index]}</div>}
        </List>
      );
    }
  }


// Filter Tab
class FilterUI extends React.Component<Props, State> {
    constructor(props: any){
		super(props);
		this.state ={
            e_value: 1.0,
            show_unassigned: true,
            g_searched: []

        }
	}  

    /**
     * Update the stored filter information and send its values up
     */
    updateShowUnassigned(e: any) {
        this.setState({show_unassigned: e})
        const values = {'show_unassinged': e, 'e_value': this.state.e_value, 'g_searched': this.state.g_searched}
        this.props.sendValuesUp(values)
    }

    /**
     * Calculate the e-value from slider input and send it's value up
     * @param slider_value Value of UI slider
     */
    setEValue(slider_value: any) {
        console.log(this.state)
        const new_value = Math.E ** (-slider_value)
        this.setState({e_value: new_value})

        // pass values up
        const values = {'show_unassinged': this.state.show_unassigned, 'e_value': new_value, 'g_searched': this.state.g_searched}
        this.props.sendValuesUp(values)
    }

    /**
     * Pass searched IDs up
     * @param e Edit event of the dropdown selector
     */
    passSearch(e: any) {
        let new_keys: string[] = []
        // extract IDs
        e.forEach((element: any) => {
          new_keys.push(element.value)
        });
        this.setState({g_searched: new_keys}, () => {
            const values = {'show_unassinged': this.state.show_unassigned, 'e_value': this.state.e_value, 'g_searched': this.state.g_searched}
            this.props.sendValuesUp(values)
        })
      }


    render() {
        return (
            <>
            <Card className="m-2">
                <Card.Body>
                    <Card.Title>Search genes</Card.Title>
                    <Select
                    // @ts-ignore
                    options={this.props.g_options}
                    components={{MenuList}}
                    filterOption={createFilter({ignoreAccents: false})}
                    isMulti defaultValue={[]}
                    onChange={(e: any) => this.passSearch(e)}/>
                </Card.Body>
            </Card>
            <Card className="m-2">
                <Card.Body>
                    <Card.Title>Filter</Card.Title>
                    <Form.Check 
                        type="switch"
                        id="show_unassigned"
                        label="Show unassinged"
                        defaultChecked={true}
                        onChange={(e) => this.updateShowUnassigned(e.target.checked)}
                    />
                    <Form.Label>e-value {"<"} {this.state.e_value}</Form.Label>
                    <Form.Range 
                        min={0}
                        max={300}
                        step={1}
                        defaultValue={0}
                        onChange={(e :any) => this.setEValue(e.target.value)}/>
                    <Form.Label>Contig Filter</Form.Label>
                    <Form.Select>
                        <option value="1">One</option>
                        <option value="2">Two</option>
                        <option value="3">Three</option>
                    </Form.Select>
                </Card.Body>
            </Card>
            </>
        );
    } 
}

export { FilterUI }
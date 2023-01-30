import React from "react";
import { Badge, Button, InputGroup } from "react-bootstrap";
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';


interface Props {
    sendValuesUp: any
    g_options: string[]
}

interface State {
    e_value: number
    show_unassigned: boolean
    g_searched: string[]
    c_searched: string[]
    valid_search: boolean
    selected_genes: string[]
    valid_gene: string
    search: string
}


// Filter Tab
class Search extends React.Component<Props, State> {
    constructor(props: any){
		super(props);
		this.state ={
            e_value: 1.0,
            show_unassigned: true,
            g_searched: [],
            c_searched: [],
            valid_search: false,
            selected_genes: [],
            valid_gene: "",
            search: ""
        }
	}  

    /**
     * Update the stored filter information and send its values up
     */
    updateShowUnassigned(e: any) {
        this.setState({show_unassigned: e})
        const values = {'show_unassinged': e, 'e_value': this.state.e_value, 'g_searched': this.state.g_searched, 'c_searched': this.state.c_searched}
        this.props.sendValuesUp(values)
    }

    /**
     * Handle searchbar inputs
     * @param key seatchbar input
     */
    searchFor(key: string) {
        if (this.props.g_options.includes(key) && !this.state.selected_genes.includes(key)) {
            this.setState({valid_search: true, valid_gene: key, search: key})
        } 
        else {
            this.setState({valid_search: false, valid_gene: "", search: key})
        }
    }

    /**
     * Submit the current search and add it to selection if it is valid
     * @param e Button event
     */
    submit = (e: any) => {
        e.preventDefault();
        if(this.state.valid_gene !== "") {
            const my_genes = this.state.selected_genes
            my_genes.push(this.state.valid_gene)
            this.setState({selected_genes: my_genes, valid_gene: "", valid_search: false, search: ""})
            this.props.sendValuesUp(my_genes)
        }
    }

    /**
     * Remove a gene name from the selection
     * @param key gene name
     */
    remove = (key: string) => {
        const my_genes = this.state.selected_genes
        const index = my_genes.indexOf(key)
        if (index > -1) {
            my_genes.splice(index, 1)
        }
        
        this.props.sendValuesUp(my_genes)
        this.setState({selected_genes: my_genes})
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
            const values = {'show_unassinged': this.state.show_unassigned, 'e_value': this.state.e_value, 'g_searched': this.state.g_searched, 'c_searched': this.state.c_searched}
            this.props.sendValuesUp(values)
        })
    }


    render() {
        return (
            <>
            <Card className="m-2">
                <Card.Body>
                    <Card.Title>Search genes</Card.Title>
                    <Form noValidate validated={false}>
                    <InputGroup>
                        <Form.Control
                            required
                            type="text"
                            placeholder="Enter gene name"
                            isInvalid={!this.state.valid_search}
                            value={this.state.search}
                            onChange={(e: any) => this.searchFor(e.target.value)}
                            />
                        <Button onClick={(e: any) => this.submit(e)} type="submit">Add</Button>
                    </InputGroup>
                    </Form>
                    {
                        this.state.selected_genes.map((gene:string) => {
                            return <Badge className="m-1" onClick={() => this.remove(gene)}>{gene} <span className="bi bi-x"></span></Badge>
                        })
                    }
                </Card.Body>
            </Card>
            </>
        );
    } 
}

export { Search }
import React from 'react';
import Loader from './../../components/Loader';
import SearchCatalogResults from './../../containers/SearchCatalogResults';
import CriteriaSelection from './../../components/CriteriaSelection';
import {Alert} from 'react-bootstrap';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';
import { Row, Col } from 'react-bootstrap';
import Subheader from 'material-ui/Subheader';
import {List} from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import RefreshIcon from 'material-ui/svg-icons/navigation/refresh';
import SaveIcon from 'material-ui/svg-icons/content/save';

export class SearchCatalog extends React.Component {
  static propTypes = {
    currentProjectSearchCriterias: React.PropTypes.array.isRequired,
    clickTogglePanel: React.PropTypes.func.isRequired,
    addSearchCriteriasToProject: React.PropTypes.func.isRequired,
    addDatasetsToProject: React.PropTypes.func.isRequired,
    addFacetKeyValue: React.PropTypes.func.isRequired,
    removeFacetKeyValue: React.PropTypes.func.isRequired,
    removeAllFacetKeyValue: React.PropTypes.func.isRequired,
    requestFacets: React.PropTypes.func.isRequired,
    receiveFacetsFailure: React.PropTypes.func.isRequired,
    receiveFacets: React.PropTypes.func.isRequired,
    requestEsgfDatasets: React.PropTypes.func.isRequired,
    receiveEsgfDatasetsFailure: React.PropTypes.func.isRequired,
    receiveEsgfDatasets: React.PropTypes.func.isRequired,
    requestPavicsDatasets: React.PropTypes.func.isRequired,
    receivePavicsDatasetsFailure: React.PropTypes.func.isRequired,
    receivePavicsDatasets: React.PropTypes.func.isRequired,
    fetchFacets: React.PropTypes.func.isRequired,
    fetchDataset: React.PropTypes.func.isRequired,
    fetchEsgfDatasets: React.PropTypes.func.isRequired,
    fetchPavicsDatasets: React.PropTypes.func.isRequired,
    esgfDatasets: React.PropTypes.object.isRequired,
    pavicsDatasets: React.PropTypes.object.isRequired,
    facets: React.PropTypes.object.isRequired,
    selectedFacets: React.PropTypes.array.isRequired,
    panelControls: React.PropTypes.object.isRequired
  };

  state = {
    type: 'dataset',
    confirmation: null,
    searchCriteriasName: '',
    selectedKey: '',
    criteriaKeys: [
      'project',
      'model',
      'variable',
      'frequency'
    ]
  };

  constructor (props) {
    super(props);
    this._onAddCriteriaKey = this._onAddCriteriaKey.bind(this);
    this._onLoadSavedCriteria = this._onLoadSavedCriteria.bind(this);
    this._ResetCriterias = this._ResetCriterias.bind(this);
    this._SaveCriterias = this._SaveCriterias.bind(this);
    this._onChangeSearchType = this._onChangeSearchType.bind(this);
    this._onSetSearchCriteriasName = this._onSetSearchCriteriasName.bind(this);
  }

  _onChangeSearchType (value) {
    alert('TODO: refetch Catalog API with type=' + value);
    this.setState({
      type: value
    });
  }

  _onLoadSavedCriteria (value) {
    let searchCriteria = this.props.currentProjectSearchCriterias.find(x => x.name === value);
    this.setState({
      selectedSavedCriteria: value
    });
    this.props.removeAllFacetKeyValue();
    searchCriteria.criterias.forEach((criteria) => {
      this.props.addFacetKeyValue(criteria.key, criteria.value);
    });
    this._onSetSearchCriteriasName = this._onSetSearchCriteriasName.bind(this);
  }

  _onAddCriteriaKey (value) {
    let arr = JSON.parse(JSON.stringify(this.state.criteriaKeys));
    arr.push(value);
    this.setState({
      criteriaKeys: arr,
      confirmation: null,
      searchCriteriasName: ''
    });
  }

  _onSetSearchCriteriasName (value) {
    this.setState({
      searchCriteriasName: value
    });
  }

  _ResetCriterias () {
    this.setState({
      criteriaKeys: [
        'project',
        'model',
        'variable',
        'frequency'
      ],
      confirmation: null,
      searchCriteriasName: ''
    });
    this.props.removeAllFacetKeyValue();
    this.props.fetchPavicsDatasets();
  }

  _SaveCriterias () {
    if (this.state.searchCriteriasName.length && this.props.selectedFacets.length) {
      if (this.props.currentProjectSearchCriterias.find( x => x.name === this.state.searchCriteriasName)) {
        this.setState({
          confirmation: <Alert bsStyle="danger" style={{marginTop: 20}}>
            Search criteria(s) already exists with the same name. Please specify another name.
          </Alert>
        });
      } else {
        this.props.addSearchCriteriasToProject({
          name: this.state.searchCriteriasName,
          date: new Date(),
          criterias: this.props.selectedFacets,
          results: this.props.pavicsDatasets.items
        });
        this.setState({
          confirmation: <Alert bsStyle="info" style={{marginTop: 20}}>
            Search criteria(s) was saved with success. <br />
            Navigate to 'Experience Management' section to manage saved search criteria(s).
          </Alert>
        });
      }
    } else {
      this.setState({
        confirmation: <Alert bsStyle="danger" style={{marginTop: 20}}>
          You need to specify a name and at least one criteria to be able to save the current search criteria(s).
        </Alert>
      });
    }
  }

  _mainComponent () {
    let mainComponent;
    if (this.props.facets.isFetching) {
      mainComponent = <Loader name="facets" />;
    } else {
      mainComponent = (
        (this.props.facets.items.length === 0) ?
          <Paper style={{ marginTop: 20 }}>
            <List>
              <Subheader>No facets found.</Subheader>
            </List>
          </Paper>
          : (
          <div>
            <Paper>
              <div className="container">
                <Row>
                  <Col sm={12} md={4} lg={4}>
                    <SelectField
                      style={{width: '95%'}}
                      fullWidth={true}
                      floatingLabelText="Load criteria(s)"
                      value={this.state.selectedSavedCriteria}
                      onChange={(event, index, value) => this._onLoadSavedCriteria(value)}>
                      {
                        this.props.currentProjectSearchCriterias.map((search, i) => {
                          return <MenuItem key={i} value={search.name} primaryText={search.name} />;
                        })
                      }
                    </SelectField>
                  </Col>
                  <Col sm={12} md={4} lg={4}>
                    <SelectField
                      style={{width: '95%'}}
                      value={this.state.type}
                      floatingLabelText="Type (TODO)"
                      onChange={(event, index, value) => this._onChangeSearchType(value)}>
                      <MenuItem value="dataset" primaryText="Dataset" />
                      <MenuItem value="file" primaryText="File" />
                    </SelectField>
                  </Col>
                  <Col sm={12} md={4} lg={4}>
                    <SelectField
                      style={{width: '95%'}}
                      floatingLabelText="Add additional criteria"
                      value={this.state.selectedKey}
                      onChange={(event, index, value) => this._onAddCriteriaKey(value)}>
                      {
                        this.props.facets.items.map((x, i) => {
                          return (this.state.criteriaKeys.includes(x.key))
                            ? null
                            : <MenuItem key={i} value={x.key} primaryText={x.key} />;
                        })
                      }
                    </SelectField>
                  </Col>
                </Row>
                <Row style={{marginBottom: 15}}>
                  {
                    this.state.criteriaKeys.map((facetKey, i) => {
                      return <CriteriaSelection
                        key={i}
                        criteriaName={facetKey}
                        variables={this.props.facets.items.find((x) => {
                          return x.key === facetKey;
                        })}
                        selectedFacets={this.props.selectedFacets}
                        addFacetKeyValue={this.props.addFacetKeyValue}
                        removeFacetKeyValue={this.props.removeFacetKeyValue}
                        fetchPavicsDatasets={this.props.fetchPavicsDatasets}
                        fetchEsgfDatasets={this.props.fetchEsgfDatasets} />;
                    })
                  }
                </Row>
                <Col>
                  <TextField
                    hintText="Define a name"
                    fullWidth={true}
                    onChange={(event, value) => this._onSetSearchCriteriasName(value)}
                    floatingLabelText="Search Criteria(s) Name" />
                </Col>
              </div>
            </Paper>
            <RaisedButton
              onClick={this._SaveCriterias}
              label="Save search criteria(s)"
              icon={<SaveIcon />}
              disabled={!this.props.selectedFacets.length}
              style={{marginTop: 20}} />
            <RaisedButton
              onClick={this._ResetCriterias}
              label="Reset"
              icon={<RefreshIcon />}
              disabled={!this.props.selectedFacets.length}
              style={{marginTop: 20, marginLeft: 20}} />
            {this.state.confirmation}
            <SearchCatalogResults {...this.props} />
          </div>
        )
      );
    }
    return mainComponent;
  }

  render () {
    return (
      <div style={{ margin: 20 }}>
        {this._mainComponent()}
      </div>
    );
  }
}
export default SearchCatalog;

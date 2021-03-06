import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import classnames from 'classnames';
import geolib from 'geolib';
import _ from 'lodash';

import SelectedCrossingContainer from 'components/Shared/CrossingMapPage/SelectedCrossingContainer';
import CrossingMapSearchBar from 'components/Shared/CrossingMapPage/CrossingMapSearchBar';
import CrossingSidebarNearbyCrossingItem from 'components/Shared/CrossingMapPage/CrossingSidebarNearbyCrossingItem';
import FilterCheckbox from 'components/Shared/FilterCheckbox';
import InfiniteCrossingStatusHistoryPaginationContainer from 'components/Dashboard/CrossingStatusHistory/InfiniteCrossingStatusHistoryPaginationContainer';
import ChevronRightDarkSvg from 'images/chevron-right-dark.svg';
import ChevronLeftDarkSvg from 'images/chevron-left-dark.svg';

import 'components/Shared/CrossingMapPage/CrossingMapSidebar.css';

class CrossingMapSidebar extends Component {
  static propTypes = {
    triggerMapResize: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      visible: true,
      showFilters: true,
      searchFocused: false,
      showNearby: true,
      showHistory: false,
      nearbyCrossings: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    // If we're unselecting a crossing, stop trying to show the history
    if (this.props.selectedCrossingId && !nextProps.selectedCrossingId) {
      this.setState({
        showNearby: true,
        showHistory: false,
      });
    }

    // If we have a new map center, different crossings, or different visibility, update nearby crossings
    if (
      this.props.center !== nextProps.center ||
      this.props.showOpen !== nextProps.showOpen ||
      this.props.showClosed !== nextProps.showClosed ||
      this.props.showCaution !== nextProps.showCaution ||
      this.props.showClosed !== nextProps.showClosed ||
      this.props.openCrossings !== nextProps.openCrossings ||
      this.props.closedCrossings !== nextProps.closedCrossings ||
      this.props.cautionCrossings !== nextProps.cautionCrossings ||
      this.props.longtermCrossings !== nextProps.longtermCrossings ||
      this.props.selectedCrossingId !== nextProps.selectedCrossingId
    ) {
      const nearbyCrossings = this.getNearbyCrossings(
        nextProps.center,
        nextProps.openCrossings,
        nextProps.closedCrossings,
        nextProps.cautionCrossings,
        nextProps.longtermCrossings,
        nextProps.showOpen,
        nextProps.showClosed,
        nextProps.showCaution,
        nextProps.showLongterm,
        nextProps.selectedCrossingId
      );
      this.setState({ nearbyCrossings: nearbyCrossings });
    }
  }

  toggleSidebar = () => {
    this.setState({ visible: !this.state.visible }, () => {
      this.props.triggerMapResize();
    });
  };

  toggleFilters = () => {
    this.setState({ showFilters: !this.state.showFilters });
  };

  toggleSearchFocus = focused => {
    this.setState({ searchFocused: focused });
  };

  toggleNearbyHistory = tab => {
    if (tab === 'nearby') {
      this.setState({
        showNearby: true,
        showHistory: false,
      });
    }

    if (tab === 'history') {
      this.setState({
        showNearby: false,
        showHistory: true,
      });
    }
  };

  getNearbyCrossings = (
    center,
    openCrossings,
    closedCrossings,
    cautionCrossings,
    longtermCrossings,
    showOpen,
    showClosed,
    showCaution,
    showLongterm,
    selectedCrossingId
  ) => {
    let nearbyCrossings = [];

    if (showOpen && openCrossings) nearbyCrossings.push(...openCrossings);
    if (showClosed && closedCrossings) nearbyCrossings.push(...closedCrossings);
    if (showCaution && cautionCrossings)
      nearbyCrossings.push(...cautionCrossings);
    if (showLongterm && longtermCrossings)
      nearbyCrossings.push(...longtermCrossings);

    _.remove(nearbyCrossings, c =>
      c.id === selectedCrossingId
    )

    return nearbyCrossings.length
      ? _.sortBy(nearbyCrossings, c =>
          geolib.getDistance(center, JSON.parse(c.geojson).coordinates),
        ).slice(0, 20)
      : [];
  };

  render() {
    const { visible, searchFocused, showNearby, showHistory } = this.state;
    const {
      toggleShowOpen,
      toggleShowClosed,
      toggleShowCaution,
      toggleShowLongterm,
      showOpen,
      showClosed,
      showCaution,
      showLongterm,
      searchQuery,
      searchQueryUpdated,
      selectedCrossingId,
      selectCrossing,
      currentUser,
      allCommunities,
      selectedCrossingName,
      center,
      setSelectedLocationCoordinates,
    } = this.props;

    const { nearbyCrossings } = this.state;

    return (
      <div className="CrossingMapSidebar__overlay-container">
        {visible && (
          <div className="CrossingMapSidebar__content">
            <div className={classnames(
                        'CrossingMapSidebar__content-noscroll',
                        {
                          'CrossingMapSidebar__content-noscroll--searchFocused': this.state.searchFocused,
                        },
                      )}>
              <CrossingMapSearchBar
                selectedCrossingId={selectedCrossingId}
                selectCrossing={selectCrossing}
                searchQuery={searchQuery}
                searchQueryUpdated={searchQueryUpdated}
                selectedCrossingName={selectedCrossingName}
                center={center}
                setSelectedLocationCoordinates={setSelectedLocationCoordinates}
                toggleSearchFocus={this.toggleSearchFocus}
                communities={allCommunities}
                communityId={(currentUser &&
                              currentUser.role !== 'floods_super_admin') ?
                             currentUser.communityId : null}
              />

              {!searchFocused && selectedCrossingId && (
                <SelectedCrossingContainer
                  crossingId={selectedCrossingId}
                  currentUser={currentUser}
                  selectCrossing={selectCrossing}
                  allCommunities={allCommunities}
                />
              )}
              {!searchFocused && !selectedCrossingId && (
                <div>
                  <div className="CrossingMapPage_sidebar-filter-sort-toggle-container">
                    <div
                      className={classnames(
                        'CrossingMapPage_sidebar-filter-toggle',
                        {
                          selected: this.state.showFilters,
                        },
                      )}
                      onClick={this.toggleFilters}
                    >
                      <div className="CrossingMapPage_sidebar-filter-toggle-text">
                        {this.state.showFilters ? (
                          <span className="CrossingMapPage_sidebar-filter-toggle-icon">
                            <FontAwesome name="minus" ariaLabel="Hide" />
                          </span>
                        ) : (
                          <span className="CrossingMapPage_sidebar-filter-toggle-icon">
                            <FontAwesome name="plus" ariaLabel="Show" />
                          </span>
                        )}{' '}
                        Filter
                      </div>
                    </div>
                    <div className="CrossingMapPage_sidebar-sort-toggle">
                      Last Updated
                      <span className="CrossingMapPage_sidebar-sort-toggle-icon">
                        <FontAwesome name="chevron-down" ariaLabel="Sort" />
                      </span>
                    </div>
                  </div>
                  {this.state.showFilters && (
                    <div className="CrossingMapPage_sidebar-filter-container">
                      <FilterCheckbox
                        isChecked={showOpen}
                        onClick={toggleShowOpen}
                      >
                        Open
                      </FilterCheckbox>
                      <FilterCheckbox
                        isChecked={showClosed}
                        onClick={toggleShowClosed}
                      >
                        Closed
                      </FilterCheckbox>
                      <FilterCheckbox
                        isChecked={showCaution}
                        onClick={toggleShowCaution}
                      >
                        Caution
                      </FilterCheckbox>
                      <FilterCheckbox
                        isChecked={showLongterm}
                        onClick={toggleShowLongterm}
                      >
                        Long-Term Closure
                      </FilterCheckbox>
                    </div>
                  )}
                </div>
              )}
              {!searchFocused && selectedCrossingId && (
                <div className="CrossingMapPage_sidebar-nearby-history-toggle">
                  <div
                    className={classnames(
                      'CrossingMapPage_sidebar-nearby-tab',
                      {
                        selected: this.state.showNearby,
                      },
                    )}
                    onClick={() => this.toggleNearbyHistory('nearby')}
                  >
                    <FontAwesome name="map-marker" /> Nearby
                  </div>
                  <div
                    className={classnames(
                      'CrossingMapPage_sidebar-history-tab',
                      {
                        selected: this.state.showHistory,
                      },
                    )}
                    onClick={() => this.toggleNearbyHistory('history')}
                  >
                    <FontAwesome name="history" /> History
                  </div>
                </div>
              )}
            </div>
            {!searchFocused && (
              <div className="CrossingMapSidebar__content-scroll">
                {showNearby && (
                  <div className="CrossingMapPage_sidebar-nearbycrossings">
                    {nearbyCrossings.map(c => (
                      <CrossingSidebarNearbyCrossingItem
                        key={c.id}
                        latestStatus={c.latestStatusCreatedAt}
                        statusId={c.latestStatusId}
                        crossing={c}
                        crossingId={c.id}
                        crossingName={c.name}
                        communityIds={c.communityIds}
                        allCommunities={allCommunities}
                      />
                    ))}
                  </div>
                )}
                {showHistory && (
                  <div className="CrossingMapPage_sidebar-crossing-status-history">
                    <InfiniteCrossingStatusHistoryPaginationContainer
                      crossingId={selectedCrossingId}
                      showNames={false}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <div
          className="CrossingMapPage_sidebar-toggle-container"
          onClick={this.toggleSidebar}
        >
          <div className="CrossingMapPage_sidebar-toggle" role="button">
            <img
              alt={visible ? 'Collapse Sidebar' : 'Expand Sidebar'}
              src={visible ? ChevronLeftDarkSvg : ChevronRightDarkSvg}
              onClick={this.toggleSidebar}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default CrossingMapSidebar;

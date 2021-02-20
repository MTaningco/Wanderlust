//Imports from libraries
import React, { Component, useState, useRef, useEffect } from "react";
import NewLandmarkTab from './NewLandmarkTab';
import NewPathTab from './NewPathTab';
import EditLandmarksTab from './EditLandmarksTab';
import EditPathsTab from './EditPathsTab';

function OtherFeatureTab({value, index, drawerValue, invalidateAuth, setLandmarks, setNewLandmark, setPaths, newPathHandler, setEditLandmark, updateLandmarks, deleteLandmark, landmarks, toInformationTab, paths, setEditPath, editPath, deletePath}) {
  return (
    <div hidden={value !== index}>
      <NewLandmarkTab setLandmarks={setLandmarks} 
        value={drawerValue} 
        index={0} 
        setNewLandmark={setNewLandmark} 
        invalidateAuth={invalidateAuth}/>
      <EditLandmarksTab 
        value={drawerValue} 
        index={1} 
        invalidateAuth={invalidateAuth} 
        setEditLandmark={setEditLandmark} 
        updateLandmarks={updateLandmarks} deleteLandmark={deleteLandmark}
        landmarks={landmarks}
        toInformationTab={toInformationTab}/>
      <NewPathTab setPaths={setPaths} 
        value={drawerValue} 
        index={2} 
        setTempPath={newPathHandler} 
        invalidateAuth={invalidateAuth}/>
      <EditPathsTab
        value={drawerValue} 
        index={3} 
        invalidateAuth={invalidateAuth} 
        setEditPath={setEditPath} 
        paths={paths}
        editPath={editPath}
        deletePath={deletePath}
        setPaths={setPaths}/>
    </div>
  );
}
 
export default OtherFeatureTab;
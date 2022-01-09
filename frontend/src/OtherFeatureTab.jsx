//Imports from libraries
import React, { Component, useState, useRef, useEffect } from "react";
import NewLandmarkTab from './NewLandmarkTab';
import NewPathTab from './NewPathTab';
import EditLandmarksTab from './EditLandmarksTab';
import EditPathsTab from './EditPathsTab';

function OtherFeatureTab({value, index, drawerValue, invalidateAuth, updateLandmark, deleteLandmark, landmarks, toInformationTab, paths, deletePath, createLandmark, updateNewLandmark, updateEditLandmark, updateNewPath, createPath, updatePath, updateEditPath, setDialogTimer, setLocateLandmarkCoordinates}) {
  return (
    <div hidden={value !== index}>
      <NewLandmarkTab 
        value={drawerValue} 
        index={0}  
        invalidateAuth={invalidateAuth}
        createLandmark={createLandmark}
        updateNewLandmark={updateNewLandmark}
        setDialogTimer={setDialogTimer}/>
      <EditLandmarksTab 
        value={drawerValue} 
        index={1} 
        invalidateAuth={invalidateAuth} 
        toInformationTab={toInformationTab}
        landmarks={landmarks}
        updateLandmark={updateLandmark} 
        updateEditLandmark={updateEditLandmark}
        deleteLandmark={deleteLandmark}
        setDialogTimer={setDialogTimer}
        setLocateLandmarkCoordinates={setLocateLandmarkCoordinates}/>
      <NewPathTab
        value={drawerValue} 
        index={2}
        invalidateAuth={invalidateAuth}
        updateNewPath={updateNewPath}
        createPath={createPath}
        setDialogTimer={setDialogTimer}/>
      <EditPathsTab
        value={drawerValue} 
        index={3} 
        invalidateAuth={invalidateAuth} 
        paths={paths}
        deletePath={deletePath}
        updatePath={updatePath}
        updateEditPath={updateEditPath}
        setDialogTimer={setDialogTimer}/>
    </div>
  );
}
 
export default OtherFeatureTab;
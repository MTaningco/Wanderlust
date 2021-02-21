//Imports from libraries
import React, { Component, useState, useRef, useEffect } from "react";
import NewLandmarkTab from './NewLandmarkTab';
import NewPathTab from './NewPathTab';
import EditLandmarksTab from './EditLandmarksTab';
import EditPathsTab from './EditPathsTab';

function OtherFeatureTab({value, index, drawerValue, invalidateAuth, setPaths, newPathHandler, updateLandmark, deleteLandmark, landmarks, toInformationTab, paths, setEditPath, editPath, deletePath, createLandmark, updateNewLandmark, updateEditLandmark}) {
  return (
    <div hidden={value !== index}>
      <NewLandmarkTab 
        value={drawerValue} 
        index={0}  
        invalidateAuth={invalidateAuth}
        createLandmark={createLandmark}
        updateNewLandmark={updateNewLandmark}/>
      <EditLandmarksTab 
        value={drawerValue} 
        index={1} 
        invalidateAuth={invalidateAuth} 
        toInformationTab={toInformationTab}
        landmarks={landmarks}
        updateLandmark={updateLandmark} 
        updateEditLandmark={updateEditLandmark}
        deleteLandmark={deleteLandmark}/>
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
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ContentShare, LocalVideo, MeetingStatus, RemoteVideo, RemoteVideos, useContentShareState, useFeaturedTileState, useLocalVideo, useMeetingManager, useMeetingStatus, useRemoteVideoTileState, useRosterState, VideoGrid } from 'amazon-chime-sdk-component-library-react';
import React, { useEffect } from 'react';

// import { useContentShareState } from '../../../providers/ContentShareProvider';
// import { useFeaturedTileState } from '../../../providers/FeaturedVideoTileProvider';
// import { useLocalVideo } from '../../../providers/LocalVideoProvider';
// import { useRemoteVideoTileState } from '../../../providers/RemoteVideoTileProvider';
// import { BaseProps } from '../../ui/Base';
// import { Layout, VideoGrid } from '../../ui/VideoGrid';
// import { ContentShare } from '../ContentShare';
// import { FeaturedRemoteVideos } from '../FeaturedRemoteVideos';
// import { LocalVideo } from '../LocalVideo';
// import { RemoteVideos } from '../RemoteVideos';

const fluidStyles = `
  height: 100%;
  width: 100%;
`;

const staticStyles = `
  display: flex;
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: 20vw;
  max-height: 30vh;
  height: auto;
  video {
    position: static;
  }
`;

// interface Props extends BaseProps {
//   /** A component to render when there are no remote videos present */
//   noRemoteVideoView?: React.ReactNode;
//   /** The layout of the grid. */
//   layout?: Layout;
// }

export const MyCustomVideoTileGrid = ({
  noRemoteVideoView,
  layout = 'featured',
  ...rest
}) => {
  const meetingManager = useMeetingManager();
  const meetingStatus  = useMeetingStatus();
  const { isVideoEnabled } = useLocalVideo();
  const { tiles, tileIdToAttendeeId, attendeeIdToTileId } = useRemoteVideoTileState(); 
  const { roster } = useRosterState();

  if (meetingStatus !== MeetingStatus.Succeeded){
    return <>No Idea</>;
  }
  const selfAttendeeId = meetingManager.meetingSessionConfiguration.credentials.attendeeId;
  const attendees = Object.values(roster);

  
  const remoteSize = tiles.length;
  const gridSize =
    remoteSize > 0 && isVideoEnabled ? remoteSize + 1 : remoteSize;

  const defaultAttende = attendees.find(x => x.chimeAttendeeId != selfAttendeeId);
  const defaultTileId = defaultAttende ? attendeeIdToTileId[defaultAttende.chimeAttendeeId] : null;
  const defaultTile = remoteSize > 0? tiles[0] : null;
  const attendee = roster[tileIdToAttendeeId[defaultTile]] || {};
  console.log("MyCustomVideoTileGrid",{
    selfAttendeeId,
    roster,
    attendees,
    defaultAttende,
    tiles,
    defaultTileId,
    defaultTile,
    attendee,
    attendeeIdToTileId,
    tileIdToAttendeeId
  })
  return (
    <VideoGrid {...rest} size={gridSize}>
      {/* <RemoteVideos /> */}
      {defaultAttende ? <RemoteVideo key={defaultTileId} tileId={defaultTileId} name={defaultAttende.name} /> : null}

      <LocalVideo
        nameplate="Me"
        css={gridSize > 1 ? fluidStyles : staticStyles}
      />
    </VideoGrid>
  );
};

export default MyCustomVideoTileGrid;
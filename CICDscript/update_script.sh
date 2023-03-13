#!/bin/bash

kubectl set image deployment/gateway-dp gateway=jhkimdocker/jcopy-gateway:JCOPY_VERSION
kubectl set image deployment/room-dp room=jhkimdocker/jcopy-room:JCOPY_VERSION
kubectl set image deployment/storage-dp storage=jhkimdocker/jcopy-storage:JCOPY_VERSION
// Catálogo de endpoints de Hik DeviceGateway (generado del protocolList del gateway).
// Los marcadores <uuid>, <ID>, <doorID>, etc. se sustituyen en tiempo de ejecución.
window.HIKGW_CATALOG = [
  {
    "id": 10101,
    "cat": "General · Dispositivos",
    "name": "Add device",
    "method": "POST",
    "path": "/ISAPI/ContentMgmt/DeviceMgmt/addDevice?format=json",
    "body": "{\n  \"DeviceInList\": [\n    {\n      \"Device\": {\n        \"protocolType\": \"ehomeV5\",\n        \"EhomeParams\": {\n          \"EhomeID\": \"K1T642\",\n          \"EhomeKey\": \"test2024\"\n        },\n        \"devName\": \"test1\",\n        \"devType\": \"AccessControl\"\n      }\n    },\n    {\n      \"Device\": {\n        \"protocolType\": \"ehomeV5\",\n        \"EhomeParams\": {\n          \"EhomeID\": \"test002\",\n          \"EhomeKey\": \"test2024\"\n        },\n        \"devName\": \"test2\",\n        \"devType\": \"encodingDev\"\n      }\n    }\n  ]\n}"
  },
  {
    "id": 10102,
    "cat": "General · Dispositivos",
    "name": "Delete device",
    "method": "POST",
    "path": "/ISAPI/ContentMgmt/DeviceMgmt/delDevice?format=json",
    "body": "{\n  \"DevIndexList\": [\n    \"2cd6716d-767f-4756-ac55-50276a5e3b4a\"\n  ]\n}"
  },
  {
    "id": 10103,
    "cat": "General · Dispositivos",
    "name": "Edit device",
    "method": "PUT",
    "path": "/ISAPI/ContentMgmt/DeviceMgmt/modDevice?format=json",
    "body": "{\n  \"DeviceInfo\": {\n    \"devIndex\": \"2cd6716d-767f-4756-ac55-50276a5e3b4a\",\n    \"protocolType\": \"ehomeV5\",\n    \"EhomeParams\": {\n      \"EhomeID\": \"111\",\n      \"EhomeKey\": \"\"\n    },\n    \"devName\": \"\"\n  }\n}"
  },
  {
    "id": 10104,
    "cat": "General · Dispositivos",
    "name": "Search for device",
    "method": "POST",
    "path": "/ISAPI/ContentMgmt/DeviceMgmt/deviceList?format=json",
    "body": "{\n  \"SearchDescription\": {\n    \"position\": 0,\n    \"maxResult\": 100,\n    \"Filter\": {\n      \"key\": \"\",\n      \"devType\": \"\",\n      \"protocolType\": [\n        \"ehomeV5\"\n      ],\n      \"devStatus\": [\n        \"online\",\n        \"offline\"\n      ]\n    }\n  }\n}"
  },
  {
    "id": 10201,
    "cat": "General · Operación de dispositivo",
    "name": "Get device information",
    "method": "GET",
    "path": "/ISAPI/System/deviceInfo?format=json&devIndex=<uuid>",
    "body": ""
  },
  {
    "id": 10202,
    "cat": "General · Operación de dispositivo",
    "name": "Set device information",
    "method": "PUT",
    "path": "/ISAPI/System/deviceInfo?format=json&devIndex=<uuid>",
    "body": "{\n  \"DeviceInfo\": {\n    \"bootReleasedDate\": \"100316\",\n    \"bootVersion\": \"V1.3.4\",\n    \"deviceDescription\": \"IPCamera\",\n    \"deviceID\": \"C92216702\",\n    \"deviceName\": \"IP CAMERA test\",\n    \"deviceType\": \"IPCamera\",\n    \"encoderReleasedDate\": \"build 190626\",\n    \"encoderVersion\": \"V7.3\",\n    \"firmwareReleasedDate\": \"build 190924\",\n    \"firmwareVersion\": \"V5.6.2\",\n    \"macAddress\": \"f8:4d:fc:d8:23:e3\",\n    \"model\": \"DS-2CD2125FWD-IS\",\n    \"serialNumber\": \"DS-2CD2125FWD-IS20190214AAWRC92216702\",\n    \"telecontrolID\": 88\n  }\n}"
  },
  {
    "id": 10203,
    "cat": "General · Operación de dispositivo",
    "name": "Get all network interfaces",
    "method": "GET",
    "path": "/ISAPI/System/Network/interfaces?format=json&devIndex=<uuid>",
    "body": ""
  },
  {
    "id": 10204,
    "cat": "General · Operación de dispositivo",
    "name": "Get a specific network interface",
    "method": "GET",
    "path": "/ISAPI/System/Network/interfaces/<ID>?format=json&devIndex=<uuid>",
    "body": ""
  },
  {
    "id": 10205,
    "cat": "General · Operación de dispositivo",
    "name": "Set a specific network interface",
    "method": "PUT",
    "path": "/ISAPI/System/Network/interfaces/<ID>?format=json&devIndex=<uuid>",
    "body": "{\n  \"NetworkInterface\": {\n    \"IPAddress\": {\n      \"DefaultGateway\": {\n        \"ipAddress\": \"10.19.82.254\",\n        \"ipv6Address\": \"::\"\n      },\n      \"Ipv6Mode\": {\n        \"ipV6AddressingType\": \"ra\",\n        \"ipv6AddressList\": [\n          {\n            \"v6Address\": {\n              \"address\": \"::\",\n              \"bitMask\": 0,\n              \"id\": \"1\",\n              \"type\": \"manual\"\n            }\n          }\n        ]\n      },\n      \"PrimaryDNS\": {\n        \"ipAddress\": \"10.1.7.97\"\n      },\n      \"SecondaryDNS\": {\n        \"ipAddress\": \"10.1.7.98\"\n      },\n      \"addressingType\": \"static\",\n      \"bitMask\": \"0\",\n      \"ipAddress\": \"10.19.82.57\",\n      \"ipVersion\": \"dual\",\n      \"ipv6Address\": \"::\",\n      \"subnetMask\": \"255.255.255.0\"\n    },\n    \"id\": 1\n  }\n}"
  },
  {
    "id": 10206,
    "cat": "General · Operación de dispositivo",
    "name": "Get a specific network IP address",
    "method": "GET",
    "path": "/ISAPI/System/Network/interfaces/<ID>/ipAddress?format=json&devIndex=<uuid>",
    "body": ""
  },
  {
    "id": 10207,
    "cat": "General · Operación de dispositivo",
    "name": "Set a specific network IP address",
    "method": "PUT",
    "path": "/ISAPI/System/Network/interfaces/<ID>/ipAddress?format=json&devIndex=<uuid>",
    "body": "{\n  \"IPAddress\": {\n    \"DefaultGateway\": {\n      \"ipAddress\": \"10.19.82.254\",\n      \"ipv6Address\": \"::\"\n    },\n    \"Ipv6Mode\": {\n      \"ipV6AddressingType\": \"ra\",\n      \"ipv6AddressList\": [\n        {\n          \"v6Address\": {\n            \"address\": \"::\",\n            \"bitMask\": 0,\n            \"id\": \"1\",\n            \"type\": \"manual\"\n          }\n        }\n      ]\n    },\n    \"PrimaryDNS\": {\n      \"ipAddress\": \"10.1.7.97\"\n    },\n    \"SecondaryDNS\": {\n      \"ipAddress\": \"10.1.7.98\"\n    },\n    \"addressingType\": \"static\",\n    \"bitMask\": \"0\",\n    \"ipAddress\": \"10.19.82.57\",\n    \"ipVersion\": \"dual\",\n    \"ipv6Address\": \"::\",\n    \"subnetMask\": \"255.255.255.0\"\n  }\n}"
  },
  {
    "id": 10208,
    "cat": "General · Operación de dispositivo",
    "name": "Reboot device",
    "method": "PUT",
    "path": "/ISAPI/System/reboot?format=json&devIndex=<uuid>",
    "body": ""
  },
  {
    "id": 10209,
    "cat": "General · Operación de dispositivo",
    "name": "Upgrade device",
    "method": "PUT",
    "path": "/ISAPI/System/upgradeEhome?format=json&devIndex=<uuid>",
    "body": "{\n  \"UpgradeParams\": {\n    \"FTPServerIP\": \"120.34.98.30\",\n    \"FTPServerPort\": 23,\n    \"userName\": \"test\",\n    \"password\": \"12345\",\n    \"file\": \"digicap.dav\"\n  }\n}"
  },
  {
    "id": 10210,
    "cat": "General · Operación de dispositivo",
    "name": "Get timezone",
    "method": "GET",
    "path": "/ISAPI/System/time/timeZone?devIndex=<uuid>",
    "body": ""
  },
  {
    "id": 10211,
    "cat": "General · Operación de dispositivo",
    "name": "Set timezone",
    "method": "PUT",
    "path": "/ISAPI/System/time/timeZone?devIndex=<uuid>",
    "body": "CST+0:00:00DST01:00:00,M5.3.0/02:00:00,M4.2.0/03:00:00"
  },
  {
    "id": 10212,
    "cat": "General · Operación de dispositivo",
    "name": "Get time",
    "method": "GET",
    "path": "/ISAPI/System/time?format=json&devIndex=<uuid>",
    "body": ""
  },
  {
    "id": 10213,
    "cat": "General · Operación de dispositivo",
    "name": "Set time",
    "method": "PUT",
    "path": "/ISAPI/System/time?format=json&devIndex=<uuid>",
    "body": "{\n  \"Time\": {\n    \"localTime\": \"2021-10-26T10:21:44+00:00\",\n    \"timeMode\": \"manual\"\n  }\n}"
  },
  {
    "id": 10301,
    "cat": "General · Mantenimiento del gateway",
    "name": "Get device gateway information",
    "method": "GET",
    "path": "/ISAPI/System/deviceInfo?format=json",
    "body": ""
  },
  {
    "id": 10302,
    "cat": "General · Mantenimiento del gateway",
    "name": "Set device gateway information",
    "method": "PUT",
    "path": "/ISAPI/System/deviceInfo?format=json",
    "body": "{\n  \"DeviceInfo\": {\n    \"deviceName\": \"test101 Gateway\"\n  }\n}"
  },
  {
    "id": 10303,
    "cat": "General · Mantenimiento del gateway",
    "name": "Reboot device gateway",
    "method": "PUT",
    "path": "/ISAPI/System/reboot?format=json",
    "body": ""
  },
  {
    "id": 10304,
    "cat": "General · Mantenimiento del gateway",
    "name": "Get device gateway time",
    "method": "GET",
    "path": "/ISAPI/System/time?format=json",
    "body": ""
  },
  {
    "id": 10305,
    "cat": "General · Mantenimiento del gateway",
    "name": "Set device gateway time",
    "method": "PUT",
    "path": "/ISAPI/System/time?format=json",
    "body": "{\n  \"Time\": {\n    \"localTime\": \"2021-10-26T09:47:25+08:00\",\n    \"timeMode\": \"manual\"\n  }\n}"
  },
  {
    "id": 10401,
    "cat": "General · Transmit ISAPI",
    "name": "device ISAPI",
    "method": "GET",
    "path": "<ISAPIURI>?devIndex=<uuid>",
    "body": ""
  },
  {
    "id": 10402,
    "cat": "Video · Stream en vivo",
    "name": "Get live view stream url",
    "method": "POST",
    "path": "/ISAPI/System/streamMedia?format=json&devIndex=<uuid>",
    "body": "{\n  \"StreamInfo\": {\n    \"id\": \"1\",\n    \"streamType\": \"main\",\n    \"method\": \"preview\"\n  }\n}"
  },
  {
    "id": 20102,
    "cat": "Video · Multimedia",
    "name": "Search playback stream url",
    "method": "POST",
    "path": "/ISAPI/ContentMgmt/search?format=json&devIndex=<uuid>",
    "body": "{\n  \"CMSearchDescription\": {\n    \"searchID\": \"C7E71364-4560-0001-6EDD-16ED17B01CCD\",\n    \"trackIDList\": [\n      {\n        \"trackID\": 101\n      }\n    ],\n    \"timeSpanList\": [\n      {\n        \"timeSpan\": {\n          \"startTime\": \"2021-10-25T16:00:00Z\",\n          \"endTime\": \"2021-10-28T15:59:59Z\"\n        }\n      }\n    ],\n    \"contentTypeList\": [\n      {\n        \"contentType\": \"video\"\n      }\n    ],\n    \"maxResults\": 40,\n    \"searchResultPostion\": 0,\n    \"metadataList\": [\n      {\n        \"metadataDescriptor\": \"recordType.meta.hikvision.com\"\n      }\n    ]\n  }\n}"
  },
  {
    "id": 20103,
    "cat": "Video · Multimedia",
    "name": "Get two-way audio channel",
    "method": "GET",
    "path": "/ISAPI/System/TwoWayAudio/channels/<ID>?format=json&devIndex=<uuid>",
    "body": ""
  },
  {
    "id": 20104,
    "cat": "Video · Multimedia",
    "name": "Get audio stream url",
    "method": "POST",
    "path": "/ISAPI/System/streamMedia?format=json&devIndex=<uuid>",
    "body": "{\n  \"StreamInfo\": {\n    \"id\": \"1\",\n    \"method\": \"twoWayAudio\"\n  }\n}"
  },
  {
    "id": 20105,
    "cat": "Video · Multimedia",
    "name": "Start manual recording",
    "method": "POST",
    "path": "/ISAPI/ContentMgmt/record/control/manual/start/tracks/<ID>?format=json&devIndex=<uuid>",
    "body": ""
  },
  {
    "id": 20106,
    "cat": "Video · Multimedia",
    "name": "Stop manual recording",
    "method": "POST",
    "path": "/ISAPI/ContentMgmt/record/control/manual/stop/tracks/<ID>?format=json&devIndex=<uuid>",
    "body": ""
  },
  {
    "id": 20107,
    "cat": "Video · Multimedia",
    "name": "Get recording schedule list",
    "method": "GET",
    "path": "/ISAPI/ContentMgmt/record/tracks?format=json&devIndex=<uuid>",
    "body": ""
  },
  {
    "id": 20108,
    "cat": "Video · Multimedia",
    "name": "Add recording schedules",
    "method": "POST",
    "path": "/ISAPI/ContentMgmt/record/tracks?format=json&devIndex=<uuid>",
    "body": "{\n  \"Track\": {\n    \"Channel\": 101,\n    \"CustomExtensionList\": [\n      {\n        \"CustomExtension\": {\n          \"CustomExtensionName\": \"\",\n          \"PostRecordTimeSeconds\": 10,\n          \"PreRecordTimeSeconds\": 5,\n          \"enableSchedule\": true\n        }\n      }\n    ],\n    \"DefaultRecordingMode\": \"CMR\",\n    \"Description\": \"trackType=standard,trackType=video,codecType=H.264-BP,resolution=1920x1080,framerate=0.880000 fps,bitrate=512 kbps\",\n    \"Enable\": true,\n    \"LoopEnable\": true,\n    \"SrcDescriptor\": {\n      \"SrcChannel\": 1,\n      \"SrcDriver\": \"RTSP\",\n      \"SrcGUID\": \"e32e6863-ea5e-4ee4-997e-f84dfcd823e3\",\n      \"SrcLogin\": \"admin\",\n      \"SrcType\": \"H.264-BP\",\n      \"SrcUrl\": \"rtsp://localhost/ISAPI/Streaming/channels/101\",\n      \"SrcUrlMethods\": \"DESCRIBE, SETUP, PLAY, TEARDOWN\",\n      \"StreamHint\": \"trackType=standard,trackType=video,codecType=H.264-BP,resolution=1920x1080,framerate=0.880000 fps,bitrate=512 kbps\"\n    },\n    \"TrackGUID\": \"e32e6863-ea5e-4ee4-997e-f84dfcd823e3\",\n    \"TrackSchedule\": {\n      \"ScheduleBlockList\": [\n        {\n          \"ScheduleBlock\": {\n            \"ScheduleAction\": [\n              {\n                \"Actions\": {\n                  \"ActionRecordingMode\": \"MOTION\",\n                  \"Log\": false,\n                  \"Record\": true,\n                  \"SaveImg\": false\n                },\n                \"Description\": \"nothing\",\n                \"ScheduleActionEndTime\": {\n                  \"DayOfWeek\": \"Monday\",\n                  \"TimeOfDay\": \"20:00:00\"\n                },\n                \"ScheduleActionStartTime\": {\n                  \"DayOfWeek\": \"Monday\",\n                  \"TimeOfDay\": \"04:00:00\"\n                },\n                \"ScheduleDSTEnable\": false,\n                \"id\": 1\n              },\n              {\n                \"Actions\": {\n                  \"ActionRecordingMode\": \"CMR\",\n                  \"Log\": false,\n                  \"Record\": true,\n                  \"SaveImg\": false\n                },\n                \"Description\": \"nothing\",\n                \"ScheduleActionEndTime\": {\n                  \"DayOfWeek\": \"Tuesday\",\n                  \"TimeOfDay\": \"24:00:00\"\n                },\n                \"ScheduleActionStartTime\": {\n                  \"DayOfWeek\": \"Tuesday\",\n                  \"TimeOfDay\": \"00:01:00\"\n                },\n                \"ScheduleDSTEnable\": false,\n                \"id\": 1\n              },\n              {\n                \"Actions\": {\n                  \"ActionRecordingMode\": \"CMR\",\n                  \"Log\": false,\n                  \"Record\": true,\n                  \"SaveImg\": false\n                },\n                \"Description\": \"nothing\",\n                \"ScheduleActionEndTime\": {\n                  \"DayOfWeek\": \"Wednesday\",\n                  \"TimeOfDay\": \"24:00:00\"\n                },\n                \"ScheduleActionStartTime\": {\n                  \"DayOfWeek\": \"Wednesday\",\n                  \"TimeOfDay\": \"00:00:00\"\n                },\n                \"ScheduleDSTEnable\": false,\n                \"id\": 1\n              },\n              {\n                \"Actions\": {\n                  \"ActionRecordingMode\": \"CMR\",\n                  \"Log\": false,\n                  \"Record\": true,\n                  \"SaveImg\": false\n                },\n                \"Description\": \"nothing\",\n                \"ScheduleActionEndTime\": {\n                  \"DayOfWeek\": \"Thursday\",\n                  \"TimeOfDay\": \"24:00:00\"\n                },\n                \"ScheduleActionStartTime\": {\n                  \"DayOfWeek\": \"Thursday\",\n                  \"TimeOfDay\": \"00:00:00\"\n                },\n                \"ScheduleDSTEnable\": false,\n                \"id\": 1\n              },\n              {\n                \"Actions\": {\n                  \"ActionRecordingMode\": \"CMR\",\n                  \"Log\": false,\n                  \"Record\": true,\n                  \"SaveImg\": false\n                },\n                \"Description\": \"nothing\",\n                \"ScheduleActionEndTime\": {\n                  \"DayOfWeek\": \"Friday\",\n                  \"TimeOfDay\": \"24:00:00\"\n                },\n                \"ScheduleActionStartTime\": {\n                  \"DayOfWeek\": \"Friday\",\n                  \"TimeOfDay\": \"00:00:00\"\n                },\n                \"ScheduleDSTEnable\": false,\n                \"id\": 1\n              },\n              {\n                \"Actions\": {\n                  \"ActionRecordingMode\": \"CMR\",\n                  \"Log\": false,\n                  \"Record\": true,\n                  \"SaveImg\": false\n                },\n                \"Description\": \"nothing\",\n                \"ScheduleActionEndTime\": {\n                  \"DayOfWeek\": \"Saturday\",\n                  \"TimeOfDay\": \"24:00:00\"\n                },\n                \"ScheduleActionStartTime\": {\n                  \"DayOfWeek\": \"Saturday\",\n                  \"TimeOfDay\": \"00:00:00\"\n                },\n                \"ScheduleDSTEnable\": false,\n                \"id\": 1\n              },\n              {\n                \"Actions\": {\n                  \"ActionRecordingMode\": \"CMR\",\n                  \"Log\": false,\n                  \"Record\": true,\n                  \"SaveImg\": false\n                },\n                \"Description\": \"nothing\",\n                \"ScheduleActionEndTime\": {\n                  \"DayOfWeek\": \"Sunday\",\n                  \"TimeOfDay\": \"24:00:00\"\n                },\n                \"ScheduleActionStartTime\": {\n                  \"DayOfWeek\": \"Sunday\",\n                  \"TimeOfDay\": \"00:00:00\"\n                },\n                \"ScheduleDSTEnable\": false,\n                \"id\": 1\n              }\n            ],\n            \"ScheduleBlockGUID\": \"{00000000-0000-0000-0000-000000000000}\",\n            \"ScheduleBlockType\": \"\"\n          }\n        }\n      ]\n    },\n    \"id\": 101\n  }\n}"
  },
  {
    "id": 20109,
    "cat": "Video · Multimedia",
    "name": "Set recording schedules",
    "method": "PUT",
    "path": "/ISAPI/ContentMgmt/record/tracks/<ID>?format=json&devIndex=<uuid>",
    "body": "{\n  \"Track\": {\n    \"Channel\": 101,\n    \"CustomExtensionList\": [\n      {\n        \"CustomExtension\": {\n          \"CustomExtensionName\": \"\",\n          \"PostRecordTimeSeconds\": 10,\n          \"PreRecordTimeSeconds\": 5,\n          \"enableSchedule\": true\n        }\n      }\n    ],\n    \"DefaultRecordingMode\": \"CMR\",\n    \"Description\": \"trackType=standard,trackType=video,codecType=H.264-BP,resolution=1920x1080,framerate=0.880000 fps,bitrate=512 kbps\",\n    \"Enable\": true,\n    \"LoopEnable\": true,\n    \"SrcDescriptor\": {\n      \"SrcChannel\": 1,\n      \"SrcDriver\": \"RTSP\",\n      \"SrcGUID\": \"e32e6863-ea5e-4ee4-997e-f84dfcd823e3\",\n      \"SrcLogin\": \"admin\",\n      \"SrcType\": \"H.264-BP\",\n      \"SrcUrl\": \"rtsp://localhost/ISAPI/Streaming/channels/101\",\n      \"SrcUrlMethods\": \"DESCRIBE, SETUP, PLAY, TEARDOWN\",\n      \"StreamHint\": \"trackType=standard,trackType=video,codecType=H.264-BP,resolution=1920x1080,framerate=0.880000 fps,bitrate=512 kbps\"\n    },\n    \"TrackGUID\": \"e32e6863-ea5e-4ee4-997e-f84dfcd823e3\",\n    \"TrackSchedule\": {\n      \"ScheduleBlockList\": [\n        {\n          \"ScheduleBlock\": {\n            \"ScheduleAction\": [\n              {\n                \"Actions\": {\n                  \"ActionRecordingMode\": \"MOTION\",\n                  \"Log\": false,\n                  \"Record\": true,\n                  \"SaveImg\": false\n                },\n                \"Description\": \"nothing\",\n                \"ScheduleActionEndTime\": {\n                  \"DayOfWeek\": \"Monday\",\n                  \"TimeOfDay\": \"20:00:00\"\n                },\n                \"ScheduleActionStartTime\": {\n                  \"DayOfWeek\": \"Monday\",\n                  \"TimeOfDay\": \"04:00:00\"\n                },\n                \"ScheduleDSTEnable\": false,\n                \"id\": 1\n              },\n              {\n                \"Actions\": {\n                  \"ActionRecordingMode\": \"CMR\",\n                  \"Log\": false,\n                  \"Record\": true,\n                  \"SaveImg\": false\n                },\n                \"Description\": \"nothing\",\n                \"ScheduleActionEndTime\": {\n                  \"DayOfWeek\": \"Tuesday\",\n                  \"TimeOfDay\": \"24:00:00\"\n                },\n                \"ScheduleActionStartTime\": {\n                  \"DayOfWeek\": \"Tuesday\",\n                  \"TimeOfDay\": \"00:01:00\"\n                },\n                \"ScheduleDSTEnable\": false,\n                \"id\": 1\n              },\n              {\n                \"Actions\": {\n                  \"ActionRecordingMode\": \"CMR\",\n                  \"Log\": false,\n                  \"Record\": true,\n                  \"SaveImg\": false\n                },\n                \"Description\": \"nothing\",\n                \"ScheduleActionEndTime\": {\n                  \"DayOfWeek\": \"Wednesday\",\n                  \"TimeOfDay\": \"24:00:00\"\n                },\n                \"ScheduleActionStartTime\": {\n                  \"DayOfWeek\": \"Wednesday\",\n                  \"TimeOfDay\": \"00:00:00\"\n                },\n                \"ScheduleDSTEnable\": false,\n                \"id\": 1\n              },\n              {\n                \"Actions\": {\n                  \"ActionRecordingMode\": \"CMR\",\n                  \"Log\": false,\n                  \"Record\": true,\n                  \"SaveImg\": false\n                },\n                \"Description\": \"nothing\",\n                \"ScheduleActionEndTime\": {\n                  \"DayOfWeek\": \"Thursday\",\n                  \"TimeOfDay\": \"24:00:00\"\n                },\n                \"ScheduleActionStartTime\": {\n                  \"DayOfWeek\": \"Thursday\",\n                  \"TimeOfDay\": \"00:00:00\"\n                },\n                \"ScheduleDSTEnable\": false,\n                \"id\": 1\n              },\n              {\n                \"Actions\": {\n                  \"ActionRecordingMode\": \"CMR\",\n                  \"Log\": false,\n                  \"Record\": true,\n                  \"SaveImg\": false\n                },\n                \"Description\": \"nothing\",\n                \"ScheduleActionEndTime\": {\n                  \"DayOfWeek\": \"Friday\",\n                  \"TimeOfDay\": \"24:00:00\"\n                },\n                \"ScheduleActionStartTime\": {\n                  \"DayOfWeek\": \"Friday\",\n                  \"TimeOfDay\": \"00:00:00\"\n                },\n                \"ScheduleDSTEnable\": false,\n                \"id\": 1\n              },\n              {\n                \"Actions\": {\n                  \"ActionRecordingMode\": \"CMR\",\n                  \"Log\": false,\n                  \"Record\": true,\n                  \"SaveImg\": false\n                },\n                \"Description\": \"nothing\",\n                \"ScheduleActionEndTime\": {\n                  \"DayOfWeek\": \"Saturday\",\n                  \"TimeOfDay\": \"24:00:00\"\n                },\n                \"ScheduleActionStartTime\": {\n                  \"DayOfWeek\": \"Saturday\",\n                  \"TimeOfDay\": \"00:00:00\"\n                },\n                \"ScheduleDSTEnable\": false,\n                \"id\": 1\n              },\n              {\n                \"Actions\": {\n                  \"ActionRecordingMode\": \"CMR\",\n                  \"Log\": false,\n                  \"Record\": true,\n                  \"SaveImg\": false\n                },\n                \"Description\": \"nothing\",\n                \"ScheduleActionEndTime\": {\n                  \"DayOfWeek\": \"Sunday\",\n                  \"TimeOfDay\": \"24:00:00\"\n                },\n                \"ScheduleActionStartTime\": {\n                  \"DayOfWeek\": \"Sunday\",\n                  \"TimeOfDay\": \"00:00:00\"\n                },\n                \"ScheduleDSTEnable\": false,\n                \"id\": 1\n              }\n            ],\n            \"ScheduleBlockGUID\": \"{00000000-0000-0000-0000-000000000000}\",\n            \"ScheduleBlockType\": \"\"\n          }\n        }\n      ]\n    },\n    \"id\": 101\n  }\n}"
  },
  {
    "id": 20110,
    "cat": "Video · Multimedia",
    "name": "Start PTZ control",
    "method": "PUT",
    "path": "/ISAPI/PTZCtrl/channels/<ID>/continuous?format=json&devIndex=<uuid>",
    "body": "{\n  \"PTZData\": {\n    \"pan\": 10,\n    \"tilt\": 10,\n    \"zoom\": 10\n  }\n}"
  },
  {
    "id": 20111,
    "cat": "Video · Multimedia",
    "name": "Add presets",
    "method": "POST",
    "path": "/ISAPI/PTZCtrl/channels/<ID>/presets?format=json&devIndex=<uuid>",
    "body": "{\n  \"PTZPresetList\": [\n    {\n      \"PTZPreset\": {\n        \"enabled\": true,\n        \"id\": 1,\n        \"presetName\": \"preset1\"\n      }\n    }\n  ]\n}"
  },
  {
    "id": 20112,
    "cat": "Video · Multimedia",
    "name": "Call a configured preset",
    "method": "PUT",
    "path": "/ISAPI/PTZCtrl/channels/<ID>/presets/<ID>/goto?format=json&devIndex=<uuid>",
    "body": ""
  },
  {
    "id": 20200,
    "cat": "Video · Operación",
    "name": "Add a Face Record",
    "method": "POST",
    "path": "/ISAPI/Intelligent/FDLib/pictureUpload?format=json&devIndex=<uuid>",
    "body": "{\n  \"PictureUploadData\": {\n    \"FDID\": \"8533053A8BE44932A487F6F81BF2BC79\",\n    \"FaceAppendData\": {\n      \"name\": \"test\"\n    }\n  }\n}"
  },
  {
    "id": 20201,
    "cat": "Video · Operación",
    "name": "Get alarm input and output",
    "method": "GET",
    "path": "/ISAPI/System/IO?format=json&devIndex=<uuid>",
    "body": ""
  },
  {
    "id": 20202,
    "cat": "Video · Operación",
    "name": "Manually trigger alarm output",
    "method": "PUT",
    "path": "/ISAPI/System/IO/outputs/<ID>/trigger?format=json&devIndex=<uuid>",
    "body": "{\n  \"IOPortData\": {\n    \"outputState\": \"high\"\n  }\n}"
  },
  {
    "id": 20203,
    "cat": "Video · Operación",
    "name": "Get video input parameters",
    "method": "GET",
    "path": "/ISAPI/System/Video/inputs/channels?format=json&devIndex=<uuid>",
    "body": ""
  },
  {
    "id": 20204,
    "cat": "Video · Operación",
    "name": "Get a specific channel parameter",
    "method": "GET",
    "path": "/ISAPI/System/Video/inputs/channels/<ID>?format=json&devIndex=<uuid>",
    "body": ""
  },
  {
    "id": 20205,
    "cat": "Video · Operación",
    "name": "Set a specific channel parameter",
    "method": "PUT",
    "path": "/ISAPI/System/Video/inputs/channels/<ID>?format=json&devIndex=<uuid>",
    "body": "{\n  \"VideoInputChannel\": {\n    \"id\": \"1\",\n    \"inputPort\": \"1\",\n    \"name\": \"IPCamera 01\",\n    \"videoFormat\": \"PAL\"\n  }\n}"
  },
  {
    "id": 20206,
    "cat": "Video · Operación",
    "name": "Get encoding channel parameters",
    "method": "GET",
    "path": "/ISAPI/Streaming/channels/<ID>?format=json&devIndex=<uuid>",
    "body": ""
  },
  {
    "id": 20207,
    "cat": "Video · Operación",
    "name": "Set encoding channel parameters",
    "method": "PUT",
    "path": "/ISAPI/Streaming/channels/<ID>?format=json&devIndex=<uuid>",
    "body": "{\n  \"StreamingChannel\": {\n    \"Audio\": {\n      \"audioCompressionType\": \"G.711ulaw\",\n      \"audioInputChannelID\": \"1\",\n      \"enabled\": true\n    },\n    \"Transport\": {\n      \"ControlProtocolList\": [\n        {\n          \"ControlProtocol\": {\n            \"streamingTransport\": \"RTSP\"\n          }\n        },\n        {\n          \"ControlProtocol\": {\n            \"streamingTransport\": \"HTTP\"\n          }\n        },\n        {\n          \"ControlProtocol\": {\n            \"streamingTransport\": \"SHTTP\"\n          }\n        }\n      ],\n      \"Multicast\": {\n        \"audioDestPortNo\": 8862,\n        \"destIPAddress\": \"0.0.0.0\",\n        \"enabled\": true,\n        \"videoDestPortNo\": 8860\n      },\n      \"Security\": {\n        \"certificateType\": \"digest\",\n        \"enabled\": true\n      },\n      \"Unicast\": {\n        \"enabled\": true,\n        \"rtpTransportType\": \"RTP/TCP\"\n      },\n      \"maxPacketSize\": 1000\n    },\n    \"Video\": {\n      \"GovLength\": 6,\n      \"H264Profile\": \"Main\",\n      \"H265Profile\": \"Main\",\n      \"PacketType\": \"PS\",\n      \"SVC\": {\n        \"enabled\": false\n      },\n      \"SmartCodec\": {\n        \"enabled\": false\n      },\n      \"constantBitRate\": 512,\n      \"enabled\": true,\n      \"fixedQuality\": 60,\n      \"keyFrameInterval\": 1000,\n      \"maxFrameRate\": 600,\n      \"smoothing\": 50,\n      \"snapShotImageType\": \"JPEG\",\n      \"videoCodecType\": \"H.264\",\n      \"videoInputChannelID\": \"1\",\n      \"videoQualityControlType\": \"CBR\",\n      \"videoResolutionHeight\": 1080,\n      \"videoResolutionWidth\": 1920,\n      \"videoScanType\": \"progressive\"\n    },\n    \"channelName\": \"IPCamera 01\",\n    \"enabled\": true,\n    \"id\": \"101\"\n  }\n}"
  },
  {
    "id": 20208,
    "cat": "Video · Operación",
    "name": "Manually capture picture",
    "method": "GET",
    "path": "/ISAPI/Streaming/channels/<channelID>/picture?format=json&devIndex=<uuid>",
    "body": ""
  },
  {
    "id": 20209,
    "cat": "Video · Operación",
    "name": "Download picture file",
    "method": "GET",
    "path": "/HikGatewayStorage/pic?C02BA69A5C71FB0AFAE44CF6640E00A9",
    "body": ""
  },
  {
    "id": 20210,
    "cat": "Video · Operación",
    "name": "Wake up",
    "method": "PUT",
    "path": "/ISAPI/System/wakeUp?format=json&devIndex=<uuid>",
    "body": ""
  },
  {
    "id": 30101,
    "cat": "Notificaciones y eventos",
    "name": "Get parameters of listening servers",
    "method": "GET",
    "path": "/ISAPI/Event/notification/httpHosts?format=json&devIndex=<uuid>",
    "body": ""
  },
  {
    "id": 30102,
    "cat": "Notificaciones y eventos",
    "name": "Add parameters of listening servers",
    "method": "POST",
    "path": "/ISAPI/Event/notification/httpHosts?format=json&devIndex=<uuid>",
    "body": "{\n  \"HttpHostNotificationList\": [\n    {\n      \"HttpHostNotification\": {\n        \"id\": \"2\",\n        \"url\": \"/event/notification\",\n        \"protocolType\": \"HTTP\",\n        \"addressingFormatType\": \"ipaddress\",\n        \"ipAddress\": \"10.21.84.48\",\n        \"portNo\": 80\n      }\n    }\n  ]\n}"
  },
  {
    "id": 30103,
    "cat": "Notificaciones y eventos",
    "name": "Set parameters of listening servers",
    "method": "PUT",
    "path": "/ISAPI/Event/notification/httpHosts?format=json&devIndex=<uuid>",
    "body": "{\n  \"HttpHostNotificationList\": [\n    {\n      \"HttpHostNotification\": {\n        \"id\": \"2\",\n        \"url\": \"/event/notification\",\n        \"protocolType\": \"HTTP\",\n        \"addressingFormatType\": \"ipaddress\",\n        \"ipAddress\": \"10.21.84.48\",\n        \"portNo\": 80\n      }\n    }\n  ]\n}"
  },
  {
    "id": 30104,
    "cat": "Notificaciones y eventos",
    "name": "Delete parameters of listening servers",
    "method": "DELETE",
    "path": "/ISAPI/Event/notification/httpHosts?format=json&devIndex=<uuid>",
    "body": ""
  },
  {
    "id": 30201,
    "cat": "Acceso · Personas/Tarjeta/Rostro/Huella",
    "name": "Add Person",
    "method": "POST",
    "path": "/ISAPI/AccessControl/UserInfo/Record?format=json&devIndex=<uuid>",
    "body": "{\n  \"UserInfo\": [\n    {\n      \"employeeNo\": \"123456\",\n      \"name\": \"test\",\n      \"Valid\": {\n        \"beginTime\": \"2017-01-01T00:00:00\",\n        \"endTime\": \"2027-12-31T23:59:59\"\n      }\n    }\n  ]\n}"
  },
  {
    "id": 30202,
    "cat": "Acceso · Personas/Tarjeta/Rostro/Huella",
    "name": "Delete Person",
    "method": "PUT",
    "path": "/ISAPI/AccessControl/UserInfoDetail/Delete?format=json&devIndex=<uuid>",
    "body": "{\n  \"UserInfoDetail\": {\n    \"mode\": \"byEmployeeNo\",\n    \"EmployeeNoList\": [\n      {\n        \"employeeNo\": \"123456\"\n      }\n    ]\n  }\n}"
  },
  {
    "id": 30203,
    "cat": "Acceso · Personas/Tarjeta/Rostro/Huella",
    "name": "Edit Person Information",
    "method": "PUT",
    "path": "/ISAPI/AccessControl/UserInfo/Modify?format=json&devIndex=<uuid>",
    "body": "{\n  \"UserInfo\": {\n    \"employeeNo\": \"123456\",\n    \"name\": \"test\",\n    \"Valid\": {\n      \"beginTime\": \"2017-08-01T17:30:08\",\n      \"endTime\": \"2027-08-01T17:30:08\"\n    }\n  }\n}"
  },
  {
    "id": 30204,
    "cat": "Acceso · Personas/Tarjeta/Rostro/Huella",
    "name": "Search for Person Details",
    "method": "POST",
    "path": "/ISAPI/AccessControl/UserInfo/Search?format=json&devIndex=<uuid>",
    "body": "{\n  \"UserInfoSearchCond\": {\n    \"searchID\": \"C7E71364-4560-0001-6EDD-16ED17B01CCD\",\n    \"searchResultPosition\": 0,\n    \"maxResults\": 30\n  }\n}"
  },
  {
    "id": 30205,
    "cat": "Acceso · Personas/Tarjeta/Rostro/Huella",
    "name": "Add a Face Record",
    "method": "POST",
    "path": "/ISAPI/Intelligent/FDLib/FaceDataRecord?format=json&devIndex=<uuid>",
    "body": "{\n  \"FaceInfo\": {\n    \"employeeNo\": \"123456\"\n  }\n}"
  },
  {
    "id": 30206,
    "cat": "Acceso · Personas/Tarjeta/Rostro/Huella",
    "name": "Delete Face Record",
    "method": "PUT",
    "path": "/ISAPI/Intelligent/FDLib/FDSearch/Delete?format=json&devIndex=<uuid>",
    "body": "{\n  \"FaceInfoDelCond\": {\n    \"EmployeeNoList\": [\n      {\n        \"employeeNo\": \"123456\"\n      }\n    ]\n  }\n}"
  },
  {
    "id": 30207,
    "cat": "Acceso · Personas/Tarjeta/Rostro/Huella",
    "name": "Add a Card",
    "method": "POST",
    "path": "/ISAPI/AccessControl/CardInfo/Record?format=json&devIndex=<uuid>",
    "body": "{\n  \"CardInfo\": {\n    \"employeeNo\": \"123456\",\n    \"cardNo\": \"1234567890\"\n  }\n}"
  },
  {
    "id": 30208,
    "cat": "Acceso · Personas/Tarjeta/Rostro/Huella",
    "name": "Delete Card",
    "method": "PUT",
    "path": "/ISAPI/AccessControl/CardInfo/Delete?format=json&devIndex=<uuid>",
    "body": "{\n  \"CardInfoDelCond\": {\n    \"CardNoList\": [\n      {\n        \"cardNo\": \"1234567890\"\n      }\n    ]\n  }\n}"
  },
  {
    "id": 30209,
    "cat": "Acceso · Personas/Tarjeta/Rostro/Huella",
    "name": "Capture Fingerprint",
    "method": "POST",
    "path": "/ISAPI/AccessControl/CaptureFingerPrint?format=json&devIndex=<uuid>",
    "body": "{\n  \"CaptureFingerPrintCond\": {\n    \"fingerNo\": 1\n  }\n}"
  },
  {
    "id": 30210,
    "cat": "Acceso · Personas/Tarjeta/Rostro/Huella",
    "name": "Add Fingerprint",
    "method": "POST",
    "path": "/ISAPI/AccessControl/FingerPrintDownload?format=json&devIndex=<uuid>",
    "body": "{\n  \"FingerPrintCfg\": {\n    \"employeeNo\": \"123456\",\n    \"fingerPrintID\": 1,\n    \"fingerData\": \"MzAxJCvpJFiId03BFFiIb0LZJTiID1VtJEis5VDRJUiEg1RlFhiUh2rVFTiADI65JYh8FpVZFbiUEmidFkiUFK6VFAjB6cbBFFi3OsuZJViQKeIVJcicoMhBFnisJOdtJYiUOq6VFpignbepFgitqNKZJpikI+YxJliULbxdJoiolybhJSighYFNJmh4hoOVFmiEgopZFmiQE4udFniQGr5lFMjAR6VZFaigHLBhFXiUIdbNFniQIuy9JYiUMbb9JoioG9kNJyh4lu8NFQijhvgVJZijbvOlFniALwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAle4zRxMAQiICApcHFmQbAATBCBL9GTJRthscDWMiUJMGDM0EElBFFoYuMQRCoheCqysBgYoZGp03EUEwDCmkawLijBSXSlwBYZgQnRdiIqCaBIOCXiARtg4kG20HcFEJFENbAMGtEahgTwIi7gWHJHADMAIK6c8iAQAlCzoxbgEAeBIjQxUQwM0POgAAAAAAZIU=\"\n  }\n}"
  },
  {
    "id": 30211,
    "cat": "Acceso · Personas/Tarjeta/Rostro/Huella",
    "name": "Delete Fingerprint",
    "method": "PUT",
    "path": "/ISAPI/AccessControl/FingerPrint/Delete?format=json&devIndex=<uuid>",
    "body": "{\n  \"FingerPrintDelete\": {\n    \"EmployeeNoDetail\": {\n      \"employeeNo\": \"123456\",\n      \"fingerPrintID\": [\n        1,\n        2,\n        3\n      ]\n    }\n  }\n}"
  },
  {
    "id": 30301,
    "cat": "Acceso · Eventos",
    "name": "Search for History Events",
    "method": "POST",
    "path": "/ISAPI/AccessControl/AcsEvent?format=json&devIndex=<uuid>",
    "body": "{\n  \"AcsEventCond\": {\n    \"searchID\": \"123\",\n    \"searchResultPosition\": 0,\n    \"maxResults\": 30\n  }\n}"
  },
  {
    "id": 30401,
    "cat": "Acceso · Puertas",
    "name": "Remotely control door",
    "method": "PUT",
    "path": "/ISAPI/AccessControl/RemoteControl/door/<ID>?format=json&devIndex=<uuid>",
    "body": "{\n  \"RemoteControlDoor\": {\n    \"cmd\": \"open\"\n  }\n}"
  },
  {
    "id": 30501,
    "cat": "Acceso · Parámetros de puerta",
    "name": "Get door parameters",
    "method": "GET",
    "path": "/ISAPI/AccessControl/Door/param/<doorID>?format=json&devIndex=<uuid>",
    "body": ""
  },
  {
    "id": 30502,
    "cat": "Acceso · Parámetros de puerta",
    "name": "Set door parameters",
    "method": "PUT",
    "path": "/ISAPI/AccessControl/Door/param/<doorID>?format=json&devIndex=<uuid>",
    "body": "{\n  \"doorName\": \"test\"\n}"
  },
  {
    "id": 30601,
    "cat": "Acceso · Programación de permisos",
    "name": "Get holiday plan parameters",
    "method": "GET",
    "path": "/ISAPI/AccessControl/UserRightHolidayPlanCfg/<holidayPlanID>?format=json&devIndex=<uuid>",
    "body": ""
  },
  {
    "id": 30602,
    "cat": "Acceso · Programación de permisos",
    "name": "Set holiday plan parameters",
    "method": "PUT",
    "path": "/ISAPI/AccessControl/UserRightHolidayPlanCfg/<holidayPlanID>?format=json&devIndex=<uuid>",
    "body": "{\n  \"UserRightHolidayPlanCfg\": {\n    \"enable\": true,\n    \"beginDate\": \"2021-01-01\",\n    \"endDate\": \"2023-01-01\",\n    \"HolidayPlanCfg\": [\n      {\n        \"id\": 1,\n        \"enable\": true,\n        \"TimeSegment\": {\n          \"beginTime\": \"00:00:00\",\n          \"endTime\": \"23:59:59\"\n        }\n      }\n    ]\n  }\n}"
  },
  {
    "id": 30603,
    "cat": "Acceso · Programación de permisos",
    "name": "Get holiday group parameters",
    "method": "GET",
    "path": "/ISAPI/AccessControl/UserRightHolidayGroupCfg/<holidayGroupID>?format=json&devIndex=<uuid>",
    "body": ""
  },
  {
    "id": 30604,
    "cat": "Acceso · Programación de permisos",
    "name": "Set holiday group parameters",
    "method": "PUT",
    "path": "/ISAPI/AccessControl/UserRightHolidayGroupCfg/<holidayGroupID>?format=json&devIndex=<uuid>",
    "body": "{\n  \"UserRightHolidayGroupCfg\": {\n    \"enable\": true,\n    \"groupName\": \"test\",\n    \"holidayPlanNo\": \"1,3,5\"\n  }\n}"
  },
  {
    "id": 30605,
    "cat": "Acceso · Programación de permisos",
    "name": "Get week plan parameters",
    "method": "GET",
    "path": "/ISAPI/AccessControl/UserRightWeekPlanCfg/<weekPlanID>?format=json&devIndex=<uuid>",
    "body": ""
  },
  {
    "id": 30606,
    "cat": "Acceso · Programación de permisos",
    "name": "Set week plan parameters",
    "method": "PUT",
    "path": "/ISAPI/AccessControl/UserRightWeekPlanCfg/<weekPlanID>?format=json&devIndex=<uuid>",
    "body": "{\n  \"UserRightWeekPlanCfg\": {\n    \"enable\": true,\n    \"WeekPlanCfg\": [\n      {\n        \"week\": \"Monday\",\n        \"id\": 1,\n        \"enable\": true,\n        \"TimeSegment\": {\n          \"beginTime\": \"10:10:00\",\n          \"endTime\": \"12:10:00\"\n        }\n      }\n    ]\n  }\n}"
  },
  {
    "id": 30607,
    "cat": "Acceso · Programación de permisos",
    "name": "Get plan template parameters",
    "method": "GET",
    "path": "/ISAPI/AccessControl/UserRightPlanTemplate/<planTemplateID>?format=json&devIndex=<uuid>",
    "body": ""
  },
  {
    "id": 30608,
    "cat": "Acceso · Programación de permisos",
    "name": "Set plan template parameters",
    "method": "PUT",
    "path": "/ISAPI/AccessControl/UserRightPlanTemplate/<planTemplateID>?format=json&devIndex=<uuid>",
    "body": "{\n  \"UserRightPlanTemplate\": {\n    \"enable\": true,\n    \"templateName\": \"test\",\n    \"weekPlanNo\": 1,\n    \"holidayGroupNo\": \"1,3,5\"\n  }\n}"
  }
];

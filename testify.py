import json

jsonobj = json.loads(json.dumps({"data": "somedata"}))

if (jsonobj.get("mdfsa")):
    print("check this out")
else:
    print("nope")

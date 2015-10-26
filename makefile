BUILD=tools
REMOTE=10.0.3.103

all:	CSS JS

CSS:
	gulp styles

JS:
	node $(BUILD)/r.js -o $(BUILD)/build.js

install:
	scp build/looker.js $(REMOTE):

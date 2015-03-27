BIN=node_modules/.bin

WEBPACK_CMD = node_modules/.bin/webpack
SASS_CMD = sassc
WATCH_CMD = node_modules/.bin/watch
AUTOPREFIXER_CMD = node_modules/.bin/autoprefixer
CLEANCSS_CMD = node_modules/.bin/cleancss
JSON_SASS_CMD = node_modules/.bin/json-sass

BABEL_ARGS = --experimental --source-maps-inline

SRC_JS = $(shell find src -name "*.js")
LIB_JS = $(patsubst src/%.js,lib/%.js,$(SRC_JS))

DOCS_MD = $(shell find docs -name "*.md")

build: build-dev minify-css

build-dev: js webpack css build-docs

# Build application quickly
# Faster on first build, but not after that
fast-build: fast-js build

# Watch for changes
watch: minify-css build-docs
	@NODE_ENV=development $(MAKE) -j5 dev-server webpack-server watch-css watch-js

clean:
	rm -rf public/flummox/
	rm -rf lib/
	rm -rf dist/

# Transpile JavaScript using Babel
js: $(LIB_JS)

$(LIB_JS): lib/%.js: src/%.js
	mkdir -p $(dir $@)
	$(BIN)/babel $< -o $@ $(BABEL_ARGS)

fast-js:
	$(BIN)/babel src -d lib $(BABEL_ARGS)

watch-js:
	$(BIN)/babel src -d lib $(BABEL_ARGS) -w

build-docs: $(DOCS_MD) js
	node lib/scripts/build-docs.js

build-static-site: clean fast-build
	rm -rf dist/
	node lib/scripts/build-static-site.js

dev-server: $(LIB_JS)
	nodemon ./lib/server

webpack-server: $(LIB_JS)
	node ./lib/server/webpack

webpack: public/js/flummox/app.js

public/js/flummox/app.js: $(SRC_JS)
	$(BIN)/webpack

css: public/flummox/css/app.css

minify-css: css public/flummox/css/app.min.css

public/flummox/css/app.css: sass/app.scss theme
	mkdir -p $(dir $@) && sassc -m $< | $(BIN)/autoprefixer > $@

public/flummox/css/app.min.css: public/flummox/css/app.css
	$(BIN)/cleancss $< > $@

watch-css:
	$(BIN)/watch "mkdir -p public/flummox/css && sassc -m sass/app.scss | $(BIN)/autoprefixer > public/flummox/css/app.css" sass

theme: sass/dependencies/_theme.scss

sass/dependencies/_theme.scss: lib/shared/theme.js
	mkdir -p $(dir $@) && $(BIN)/json-sass -i $< \
	| sed '1s/^/$$theme: /' \
	> $@

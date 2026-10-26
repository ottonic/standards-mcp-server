# Standards MCP server: reference tolerance data for AI assistants.

default:
	just --list

setup:
	npm install

dev:
	npm run dev

build:
	npm run build

test:
	npm test

# No native toolchain: the server is pure TypeScript with its data in the source.
test-integration:
	npm run test:integration

typecheck:
	npm run typecheck

lint:
	npm run lint

fmt:
	npm run fmt

fmt-check:
	npm run fmt:check

check: fmt-check lint typecheck test

clean:
	rm -rf dist node_modules

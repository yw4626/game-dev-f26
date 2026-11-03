# External provenance validation

The original evolution import source hashes remain in dist/evolution-v10.js. Raw shipped configuration dumps and the original game are not distributed. The previous test read files outside the project and used Windows-specific separators; it could not pass in a clean course clone. Portable tests now verify provenance metadata and engine semantics. They do not claim to re-verify omitted original files. Source-byte verification remains a local archival procedure in the original workspace, not a CI requirement. No gameplay values changed.

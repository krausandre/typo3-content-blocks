.. include:: /Includes.rst.txt

.. _feature-98313-1677422660:

============================================
Feature: #98313 - Content Blocks Backend API
============================================

See :issue:`98313`

Description
===========

The concept of a so called `Content Block` is introduced in the form of a new
system extension `content_blocks` into the core. Primarily, a Content Block is
an abstract way of defining a Content Element for the :sql:`tt_content` table.
This is done by creating a composer package with the type `typo3-content-block`
and installing it via composer. Installations in classic mode put the package
inside `typo3conf/content-blocks`. By doing so, the Content Block will be loaded
automatically.

Structure
---------

A Content Block consists of this directory structure:

::

    Resources
        Private
            Language
                Labels.xlf
            EditorInterface.yaml (required)
            EditorPreview.html (required)
            Frontend.html (required)
        Public
            ContentBlockIcon.svg
            EditorPreview.css
            Frontend.css
            Frontend.js
    composer.json (required)


composer.json
^^^^^^^^^^^^^

Most importantly for a working Content Block there has to be a `composer.json`
file (also for classic mode):

.. code-block:: json
   :caption: composer.json

    {
        "name": "vendor/package",
        "description": "Your description of choice",
        "type": "typo3-content-block",
        "license": "GPL-2.0-or-later"
    }

The vendor and package names are taken to prefix database columns, so it is
easier to prevent colliding column names. In composer mode it is required to
even install the package.

EditorInterface.yaml
^^^^^^^^^^^^^^^^^^^^

The second most important part is the `EditorInterface.yaml` file. This yaml
file defines both the available fields and the structure of the Content Element:

.. code-block:: yaml
   :caption: Resources/Private/EditorInterface.yaml

    group: common
    fields:
      - identifier: header
        type: Text
        useExistingField: true
      - identifier: my_text_field
        type: Text
        properties:
          max: 10

The :yaml:`group` option defines where to put your content element inside the
Content Element Wizard. The default is :yaml:`common`. Inside :yaml:`fields` you
define the structure and configuration of the necessary fields. The
:yaml:`identifier` has to be unique per Content Block. There is an exception if
you enter a `Collection` field. Fields within a Collection should be unique, but
can have the same identifier as on the first level.

:yaml:`properties` is equivalent to the TCA :php:`config` part. All options are
allowed, which can also be configured in PHP.

It is possible to reuse existing fields with the flag :yaml:`useExistingField`.
This allows e.g. to use the same field `header` or `bodytext` across multiple
Content Blocks with different configuration. System fields like
`row_description` are disabled per default, so you can't reuse those.

EditorPreview.html / Frontend.html
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The `EditorPreview.html` is the Fluid template for the backend preview and the
`Frontend.html` template for the frontend. Both contain the above defined fields
inside the variable :html:`cb` and can be directly accessed. They also exist
inside the well-known :html:`data` variable, this is just for convenience:

.. code-block:: html

    <f:asset.css identifier="content-block-foo" href="CB:foo/dist/Frontend.css"/>
    <f:asset.script identifier="content-block-foo" src="CB:foo/dist/Frontend.js"/>

    My header: {cb.header}
    My textfield: {cb.my_text_field}

In contrast to extensions, resource identifiers for Content Blocks are prefixed
with `CB:vendor/package`, instead of `EXT:extension`. Besides that, it works
identically. The same goes for language labels, when using :html:`f:translate`.

For reference type of fields like `File`, `Reference` or `Category`, the
relations are resolved automatically. This means data processing is already
applied for most cases. This, however, is not applied recursively for foreign
tables. E.g. referencing a `pages` record with `Reference` does not process the
`media` field. For this, you need to define your own
:typoscript:`dataProcessing` TypoScript configuration.

Impact
======

Integrators now have an easier life creating new content elements by defining
composer packages with YAML configuration. All necessary configuration is
gathered within a single Content Block and can be independently installed /
uninstalled. This allows for easy sharing across projects and even distribution
of ready-to-use Content Blocks.

.. index:: Backend, Frontend, TCA, YAML, ext:core

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
In the long term, it should be possible to define any type of data-containing
block. The main concept is about a YAML file containing all information needed
to generate everything what is required for a new record type:

*  TSConfig (:typoscript:`mod.wizards.newContentElement`, for content elements only, automatically)
*  TypoScript (:typoscript:`FLUIDTEMPLATE`, for content elements only, automatically)
*  CType (New type is added in CType select list, for content elements only, automatically)
*  Icon (Added for newContentElementWizard and CType select, for content elements only, automatically)
*  TCA (:php:`columns`, :php:`types`, :php:`ctrl`, :php:`columnsOverrides`, automatically)
*  SQL (Definition for new fields and new tables with sane defaults, automatically)
*  XLF (Standardized way of defining key names, manually or command)
*  Fluid Templates (For Backend Previews and Frontend Rendering, manually or command)

A simple content element consists of many different configurations in various
languages, which makes it especially hard for beginners to start with.
The Content Blocks YAML definition is a so-called DSL (Domain Specific Language),
which is simply put another language on top of the current one, with the benefit
of combining everything listed above into one definition.

Content Blocks are not there (and not able) to replace the current system, but
adds another abstraction layer to a complicated API. They can still be extended
the traditional way. For TCA there is a dedicated PSR-14 event
:php:`\TYPO3\CMS\ContentBlocks\Event/AfterContentBlocksTcaCompilationEvent` to
manipulate the generated TCA.

To create a new content block, a folder `ContentBlocks` has to be created
on the root level inside an existing and loaded extension. To quickly kickstart
a content block, the command :shell:`make:content-block` can be used.

Structure
---------

A Content Block consists of this directory structure:

::

    Assets
        ContentBlockIcon.svg (optional custom icon)
        EditorPreview.css (suggestion)
        Frontend.css (suggestion)
        Frontend.js (suggestion)
    Source
        Language
            Labels.xlf (required)
        EditorPreview.html (optional custom backend preview)
        Frontend.html (only required for Frontend rendering)
    EditorInterface.yaml (required)

EditorInterface.yaml
^^^^^^^^^^^^^^^^^^^^

The most important part is the `EditorInterface.yaml` file. This yaml file
defines both the available fields and the structure of the Content Element:

.. code-block:: yaml
   :caption: Resources/Private/EditorInterface.yaml

    name: vendor/package
    group: common
    fields:
      - identifier: header
        type: Text
        useExistingField: true
      - identifier: my_text_field
        type: Text
        properties:
          max: 10

First of all, a :yaml:`name` has to be defined. It must be unique inside your
installation. It consists, similarly to composer package names, of a vendor and
a package part separated by a slash. It is used to prefix new field names, new
tables and record type identifiers.

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
Content Blocks with different configuration. Be aware that system fields like
`l18n_parent` shouldn't be reused. A list of sane reusable fields can be
referenced in the documentation. Of course, own custom fields can be reused as
well. It is advised to store them centrally in your site package.

EditorPreview.html / Frontend.html
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The `EditorPreview.html` is the Fluid template for the backend preview and the
`Frontend.html` template for the frontend. Both contain the above defined fields
inside the variable :html:`cb` and can be directly accessed. They also exist
inside the well-known :html:`data` variable, this is just for convenience:

.. code-block:: html

    <cb:asset.css identifier="content-block-foo" name="vendor/package" file="Frontend.css"/>
    <cb:asset.script identifier="content-block-foo" name="vendor/package" file="Frontend.js"/>
    <cb:translate name="vendor/package" key="my-key"/>

    My header: {cb.header}
    My textfield: {cb.my_text_field}

Content Blocks provide their own asset view helpers :html:`<cb:asset.css>` and
:html:`<cb:asset.script>`. Required arguments are :html:`identifier`,
:html:`name` (vendor/package) and :html:`file` (relative to Resources/Public
inside the Content Block). Be aware: the core asset view helpers won't work for
content blocks.

For frontend translations Content Blocks also provides its own translation
view helper. This can be seen as a simplified :html:`f:translate` view helper.
Required arguments are :html:`name` (The name of the Content Block) and
:html:`key`. The view helper will automatically resolve the path to the
`Labels.xlf` of the requested content block.

For reference type of fields like `File`, `Reference` or `Category`, the
relations are resolved automatically. This means data processing is already
applied for most cases. This, however, is not applied recursively for foreign
tables. E.g. referencing a `pages` record with `Reference` does not process the
`media` field. For this, you need to define your own
:typoscript:`dataProcessing` TypoScript configuration.

Impact
======

Integrators now have an easier life creating new content elements by defining
YAML configuration inside a content block. All necessary configuration is
gathered within a single Content Block and can be independently installed /
uninstalled. This allows for easy sharing across projects and even distribution
of ready-to-use Content Blocks.

.. index:: Backend, Frontend, TCA, YAML, ext:core

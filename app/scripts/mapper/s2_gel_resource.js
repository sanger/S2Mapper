//This file is part of S2 and is distributed under the terms of GNU General Public License version 1 or later;
//Please refer to the LICENSE and README files for information on licensing and authorship of this file.
//Copyright (C) 2013 Genome Research Ltd.
define([
  "mapper/s2_base_resource",
  "mapper/s2_labeling_module",
  "mapper/s2_batchable_module"
], function(BaseResource, LabelingModule, BatchableModule){
  'use strict';

  var Gel = BaseResource.extendAs("gel", function(gelInstance, options) {
    $.extend(gelInstance, instanceMethods);
    $.extend(gelInstance, LabelingModule);
    return gelInstance;
  });

  Gel.resourceType      = "gel";
  Gel.transferBehaviour = "plateLike";

  var instanceMethods = BatchableModule(Gel.resourceType);

  return Gel;
});


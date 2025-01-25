import { TestBed } from '@angular/core/testing';

import { DeepControlModelService } from './deep-control-model.service';

describe('DeepControlModelService', () => {
  let service: DeepControlModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeepControlModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

QUnit.module('LatLng', function() {
    QUnit.test('toArray()', function(assert) {
        let latLng = new LatLng(-2,3);
        assert.equal(-2,latLng.toArray()[0]);
        assert.equal(3,latLng.toArray()[1]);
    });
    QUnit.test('toString()', function(assert) {
        let latLng = new LatLng(23,-85);
        assert.equal('(23,-85)',latLng.toString());
    });
    QUnit.test("Lat or Lng are out of Bounds exception",function(assert) {
        try{
            let latLng = new LatLng(-181,2);
        }catch(e){
            assert.equal(e.type,"Lat or Lng are out of Bounds");
        }
    });
});
/**
 * @module lib/list
 * @exports {Function}
 */

var Table = require('./Table')

class List extends Table {
  /**
   * Define table formatting for parent class
   * @constructor
   * @param {InstancesCollection}
   */
  constructor (instances) {
    super({
      head: [
        'REPO',
        'BRANCH',
        'STATUS',
        'OWNER'
      ].map((s) => { return s.white.bold }),
      chars: {
        'top': '-',
        'top-mid': '',
        'top-left': '',
        'top-right': '',
        'bottom': '-',
        'bottom-mid': '',
        'bottom-left': '',
        'bottom-right': '',
        'left': '',
        'left-mid': '',
        'mid': '',
        'mid-mid': '',
        'right': '',
        'right-mid': '',
        'middle': ' | '
      },
      style: { 'padding-left': 0, 'padding-right': 0 }
    })
    this.instances = instances
  }

  /**
   * Created a sorted array from the instances collection
   * @return Array<InstanceModel>
   */
  _sortInstances () {
    var compareKeypath = 'contextVersion.appCodeVersions[0].repo'
    /**
     * Compare Instance repository name lexicographically
     * @param {InstanceModel} a
     * @param {InstanceModel} b
     * @return Boolean
     */
    var comparator = function (a, b) {
      return a.get(compareKeypath) > b.get(compareKeypath)
    }
    return this.instances.sort(comparator)
  }

  /**
   * Iterate over array of instances and push rows onto table
   * @param {Array<InstanceModel>} instances - sorted array of instances
   */
  _seedTableData (instances) {
    instances.forEach((instance) => {
      this._pushRow([
        instance.get('contextVersion.appCodeVersions[0].repo'),
        instance.get('contextVersion.appCodeVersions[0].branch'),
        instance.get('container.inspect.State.Status'),
        instance.get('createdBy.username')
      ])
    })
  }

  /**
   * Output table to stdtou
   */
  output () {
    var sorted = this._sortInstances()
    this._seedTableData(sorted)
    super.output()
  }
}

module.exports = List

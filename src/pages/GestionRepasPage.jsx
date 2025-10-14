import { useState, useEffect, useCallback } from 'react'
import { AppHeader } from '@/components/AppHeader'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Edit, ArrowLeft, Search, Save } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Dialog, DialogContent, DialogHeader, DialogFooter } from '@/components/ui/dialog'
import mealItemService from '@/services/mealItem.service'
import { toast } from 'sonner'

// Types de repas fixes
const MEAL_TYPES = [
  { value: 'petit-dejeuner', label: 'Petit-déjeuner', icon: '🌅' },
  { value: 'collation-matin', label: 'Collation matinale', icon: '🍎' },
  { value: 'dejeuner', label: 'Déjeuner', icon: '🍽️' },
  { value: 'collation-apres-midi', label: 'Collation après-midi', icon: '🥤' },
  { value: 'diner', label: 'Dîner', icon: '🌙' },
  { value: 'collation-soir', label: 'Collation du soir', icon: '🥛' },
]

export default function GestionRepasPage() {
  const [mealItems, setMealItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [loading, setLoading] = useState(false)
  
  // État pour créer/modifier
  const [showDialog, setShowDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentItem, setCurrentItem] = useState({
    id: null,
    name: '',
    meal_type_id: '',
    category: '',
    description: ''
  })

  const loadMealItems = async () => {
    try {
      setLoading(true)
      const data = await mealItemService.getAll()
      setMealItems(data)
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      toast.error('Erreur lors du chargement des repas')
    } finally {
      setLoading(false)
    }
  }

  const filterMealItems = useCallback(() => {
    let filtered = [...mealItems]
    
    // Filtrer par type
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.meal_type_id === filterType)
    }
    
    // Filtrer par recherche
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    setFilteredItems(filtered)
  }, [mealItems, searchTerm, filterType])

  useEffect(() => {
    loadMealItems()
  }, [])

  useEffect(() => {
    filterMealItems()
  }, [filterMealItems])

  const handleCreate = () => {
    setEditMode(false)
    setCurrentItem({
      id: null,
      name: '',
      meal_type_id: '',
      category: '',
      description: ''
    })
    setShowDialog(true)
  }

  const handleEdit = (item) => {
    setEditMode(true)
    setCurrentItem({
      id: item.id,
      name: item.name,
      meal_type_id: item.meal_type_id || '',
      category: item.category || '',
      description: item.description || ''
    })
    setShowDialog(true)
  }

  const handleSave = async () => {
    if (!currentItem.name) {
      toast.error('Le nom du repas est obligatoire')
      return
    }

    if (!currentItem.meal_type_id) {
      toast.error('Le type de repas est obligatoire')
      return
    }

    try {
      if (editMode) {
        await mealItemService.update(currentItem.id, {
          name: currentItem.name,
          meal_type_id: currentItem.meal_type_id,
          category: currentItem.category,
          description: currentItem.description
        })
        toast.success('Repas modifié avec succès')
      } else {
        await mealItemService.create({
          name: currentItem.name,
          meal_type_id: currentItem.meal_type_id,
          category: currentItem.category,
          description: currentItem.description
        })
        toast.success('Repas créé avec succès')
      }
      
      setShowDialog(false)
      loadMealItems()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) return

    try {
      await mealItemService.delete(id)
      toast.success('Repas supprimé avec succès')
      loadMealItems()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const getMealTypeInfo = (typeId) => {
    return MEAL_TYPES.find(t => t.value === typeId)
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Protéines': 'bg-primary/10 text-primary border-primary/30',
      'Glucides': 'bg-green-100 text-green-700 border-green-300',
      'Lipides': 'bg-warning/10 text-warning-foreground border-warning/30',
      'Légumes': 'bg-emerald-100 text-emerald-700 border-emerald-300',
    }
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-300'
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-primary/5 via-white to-destructive/5">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 space-y-8 p-8">
            {/* Header Amélioré */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-destructive rounded-3xl blur-2xl opacity-10"></div>
              <div className="relative bg-white rounded-3xl shadow-xl border border-primary/20 p-8">
            <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <Button 
                      variant="outline" 
                      asChild 
                      className="h-12 px-6 gap-2 hover:bg-primary/5 border-primary/20 transition-all duration-300 hover:shadow-md"
                    >
                  <Link to="/plans-nutrition">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-semibold">Retour</span>
                  </Link>
                </Button>
                    <div className="border-l border-gray-300 h-12"></div>
                <div>
                      <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-destructive to-primary bg-clip-text text-transparent">
                        🍽️ Gestion des Repas
                  </h1>
                      <p className="text-lg text-gray-600 mt-2 font-medium">
                        Créez et gérez votre bibliothèque de repas nutritionnels
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleCreate}
                    size="lg"
                    className="h-14 px-8 gap-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                    <Plus className="h-5 w-5" />
                    <span className="font-bold">Nouveau repas</span>
              </Button>
                </div>
              </div>
            </div>

            {/* Filtres Modernisés */}
            <Card className="border-2 border-orange-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    <Search className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-800">Filtres de recherche</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                      🔍 Rechercher
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-orange-400" />
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Nom du repas, catégorie..."
                        className="pl-12 h-12 border-2 border-gray-200 focus:border-orange-400 rounded-xl text-base transition-all duration-300"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                      🍴 Type de repas
                    </Label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-orange-400 rounded-xl text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="all" className="text-base font-medium">Tous les types</SelectItem>
                        {MEAL_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="text-base">
                            {type.icon} {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques Modernisées */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-orange-200">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-4xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                        {mealItems.length}
                      </div>
                      <p className="text-sm font-semibold text-gray-600 mt-1">Total repas</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                      <span className="text-3xl">📊</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {MEAL_TYPES.slice(0, 3).map((type, idx) => {
                const count = mealItems.filter(item => item.meal_type_id === type.value).length
                const gradients = [
                  'from-blue-500 to-cyan-500',
                  'from-green-500 to-emerald-500',
                  'from-purple-500 to-pink-500'
                ]
                return (
                  <Card key={type.value} className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-200">
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradients[idx]} opacity-5 group-hover:opacity-15 transition-opacity`}></div>
                    <CardContent className="p-6 relative">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-4xl font-black text-gray-800">{count}</div>
                          <p className="text-sm font-semibold text-gray-600 mt-1">{type.label}</p>
                        </div>
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradients[idx]} flex items-center justify-center shadow-lg`}>
                          <span className="text-3xl">{type.icon}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Liste des repas par type - Design Amélioré */}
            {loading ? (
              <Card className="border-2 border-orange-100 shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-lg font-semibold text-gray-600">Chargement des repas...</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {filterType === 'all' ? (
                  // Afficher par type
                  MEAL_TYPES.map((mealType) => {
                    const itemsForType = filteredItems.filter(item => item.meal_type_id === mealType.value)
                    if (itemsForType.length === 0) return null
                    
                    return (
                      <Card key={mealType.value} className="border-2 border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-100">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                              <span className="text-4xl">{mealType.icon}</span>
                            </div>
                              <div>
                              <CardTitle className="text-2xl font-bold text-gray-800">{mealType.label}</CardTitle>
                              <CardDescription className="text-base font-medium mt-1">
                                {itemsForType.length} repas disponible{itemsForType.length > 1 ? 's' : ''}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="grid gap-4">
                            {itemsForType.map((item) => (
                              <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-100 hover:border-orange-200 bg-gradient-to-br from-white to-gray-50">
                                <CardContent className="p-5">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                      <div className="font-bold text-xl text-gray-800 group-hover:text-orange-600 transition-colors">
                                        {item.name}
                                      </div>
                                      <div className="flex items-center gap-3 flex-wrap">
                                        {item.category && (
                                          <Badge className={`${getCategoryColor(item.category)} font-semibold text-sm px-3 py-1`}>
                                            {item.category}
                                          </Badge>
                                        )}
                                      </div>
                                      {item.description && (
                                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEdit(item)}
                                        className="h-10 w-10 p-0 border-2 hover:bg-primary/5 hover:border-primary transition-all"
                                      >
                                        <Edit className="h-4 w-4 text-blue-600" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDelete(item.id, item.name)}
                                        className="h-10 w-10 p-0 border-2 hover:bg-red-50 hover:border-red-400 transition-all"
                                      >
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                ) : (
                  // Afficher résultats filtrés
                  <Card className="border-2 border-gray-200 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                          <Search className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold">Résultats de recherche</CardTitle>
                          <CardDescription className="text-base font-medium mt-1">
                            {filteredItems.length} repas trouvé{filteredItems.length > 1 ? 's' : ''}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {filteredItems.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                            <Search className="h-12 w-12 text-orange-400" />
                          </div>
                          <p className="text-xl font-semibold text-gray-600 mb-2">Aucun repas trouvé</p>
                          <p className="text-gray-500">Essayez avec d&apos;autres critères de recherche</p>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {filteredItems.map((item) => {
                            const typeInfo = getMealTypeInfo(item.meal_type_id)
                            return (
                              <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-100 hover:border-orange-200 bg-gradient-to-br from-white to-gray-50">
                                <CardContent className="p-5">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                      <div className="flex items-center gap-3">
                                        {typeInfo && (
                                          <span className="text-3xl">{typeInfo.icon}</span>
                                        )}
                                        <div className="font-bold text-xl text-gray-800 group-hover:text-orange-600 transition-colors">
                                          {item.name}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3 flex-wrap">
                                        {typeInfo && (
                                          <Badge variant="secondary" className="text-sm font-semibold px-3 py-1">
                                            {typeInfo.label}
                                          </Badge>
                                        )}
                                        {item.category && (
                                          <Badge className={`${getCategoryColor(item.category)} font-semibold text-sm px-3 py-1`}>
                                            {item.category}
                                          </Badge>
                                        )}
                                      </div>
                                      {item.description && (
                                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEdit(item)}
                                        className="h-10 w-10 p-0 border-2 hover:bg-primary/5 hover:border-primary transition-all"
                                      >
                                        <Edit className="h-4 w-4 text-blue-600" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDelete(item.id, item.name)}
                                        className="h-10 w-10 p-0 border-2 hover:bg-red-50 hover:border-red-400 transition-all"
                                      >
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Dialog Créer/Modifier - DESIGN PREMIUM */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogContent className="sm:max-w-[900px] max-h-[95vh] overflow-hidden flex flex-col p-0 gap-0 bg-gradient-to-br from-white to-gray-50">
                {/* HEADER PREMIUM */}
                <div className={`sticky top-0 z-50 relative overflow-hidden ${editMode ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gradient-to-r from-orange-600 to-amber-600'} shadow-xl`}>
                  <div className="absolute inset-0 bg-black/5"></div>
                  <DialogHeader className="relative p-8 text-white">
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/30">
                        {editMode ? <Edit className="h-10 w-10 text-white" /> : <Plus className="h-10 w-10 text-white" />}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-white text-3xl font-extrabold mb-3 tracking-tight drop-shadow-lg">
                          {editMode ? 'Modifier le repas' : 'Nouveau repas'}
                        </h2>
                        <p className="text-white text-base font-semibold opacity-95">
                          {editMode ? 'Modifiez les informations du repas existant' : 'Créez un nouveau repas pour enrichir votre bibliothèque nutritionnelle'}
                        </p>
                      </div>
                    </div>
                  </DialogHeader>
                </div>

                {/* CONTENU SCROLLABLE PREMIUM */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                  {/* Nom du repas - Section Premium */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                        <span className="text-xl">🍽️</span>
                      </div>
                      <Label htmlFor="name" className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        Nom du repas
                        <Badge className="bg-red-500 text-white text-xs">Obligatoire</Badge>
                      </Label>
                    </div>
                        <Input
                      id="name"
                      className="text-lg h-16 border-3 border-gray-300 focus:border-orange-500 rounded-2xl px-6 font-medium shadow-sm focus:shadow-lg transition-all"
                          value={currentItem.name}
                          onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                      placeholder="Ex: Poulet grillé 200g avec légumes et riz complet"
                    />
                  </div>

                  {/* Type et Catégorie - Layout Premium */}
                  <div className="grid grid-cols-1 gap-6">
                    {/* Type de repas */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                          <span className="text-xl">⏰</span>
                        </div>
                        <Label htmlFor="meal-type" className="text-xl font-bold text-gray-800 flex items-center gap-2">
                          Type de repas
                          <Badge className="bg-red-500 text-white text-xs">Obligatoire</Badge>
                        </Label>
                      </div>
                          <Select 
                            value={currentItem.meal_type_id} 
                            onValueChange={(value) => setCurrentItem({ ...currentItem, meal_type_id: value })}
                          >
                        <SelectTrigger id="meal-type" className="h-16 text-lg border-3 border-gray-300 focus:border-blue-500 rounded-2xl px-6 font-medium shadow-sm">
                          <SelectValue placeholder="🍴 Sélectionner le moment du repas..." />
                            </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                              {MEAL_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value} className="text-lg py-4 font-medium">
                              <span className="text-2xl mr-3">{type.icon}</span>
                              {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                    {/* Catégorie */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                          <span className="text-xl">🏷️</span>
                        </div>
                        <Label htmlFor="category" className="text-xl font-bold text-gray-800">
                          Catégorie nutritionnelle
                        </Label>
                      </div>
                          <Select 
                            value={currentItem.category} 
                            onValueChange={(value) => setCurrentItem({ ...currentItem, category: value })}
                          >
                        <SelectTrigger id="category" className="h-16 text-lg border-3 border-gray-300 focus:border-green-500 rounded-2xl px-6 font-medium shadow-sm">
                          <SelectValue placeholder="📊 Sélectionner la catégorie..." />
                            </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          <SelectItem value="Protéines" className="text-lg py-4 font-medium">
                            <span className="text-2xl mr-3">🥩</span> Protéines
                          </SelectItem>
                          <SelectItem value="Glucides" className="text-lg py-4 font-medium">
                            <span className="text-2xl mr-3">🍞</span> Glucides
                          </SelectItem>
                          <SelectItem value="Lipides" className="text-lg py-4 font-medium">
                            <span className="text-2xl mr-3">🥑</span> Lipides
                          </SelectItem>
                          <SelectItem value="Légumes" className="text-lg py-4 font-medium">
                            <span className="text-2xl mr-3">🥗</span> Légumes
                          </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                  </div>

                  {/* Description - Section Premium */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                        <span className="text-xl">📝</span>
                      </div>
                      <Label htmlFor="description" className="text-xl font-bold text-gray-800">
                        Description détaillée
                      </Label>
                    </div>
                      <Textarea
                      id="description"
                      className="min-h-[250px] text-lg border-3 border-gray-300 focus:border-purple-500 rounded-2xl px-6 py-4 font-medium shadow-sm resize-none"
                        value={currentItem.description}
                        onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                      placeholder="📊 Valeurs nutritionnelles (calories, protéines, glucides, lipides)&#10;&#10;🥗 Liste des ingrédients et quantités&#10;&#10;⚠️ Allergènes et contre-indications&#10;&#10;👨‍🍳 Mode de préparation ou conseils de consommation&#10;&#10;💡 Informations complémentaires..."
                    />
                  </div>

                  {/* Aperçu Premium */}
                  {(currentItem.name || currentItem.meal_type_id || currentItem.category) && (
                    <div className="relative overflow-hidden rounded-2xl border-3 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 shadow-xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-3xl"></div>
                      <div className="relative p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                            <span className="text-2xl">👁️</span>
                          </div>
                          <h4 className="text-2xl font-black text-gray-800">Aperçu en temps réel</h4>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 space-y-4 border border-orange-200/50">
                          {currentItem.name && (
                            <div>
                              <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">Nom du repas</span>
                              <p className="text-lg font-bold text-gray-900 mt-1">{currentItem.name}</p>
                            </div>
                          )}
                          {currentItem.meal_type_id && (
                            <div>
                              <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">Type de repas</span>
                              <p className="text-base font-semibold text-gray-900 mt-1 flex items-center gap-2">
                                <span className="text-xl">{MEAL_TYPES.find(t => t.value === currentItem.meal_type_id)?.icon}</span>
                                {MEAL_TYPES.find(t => t.value === currentItem.meal_type_id)?.label}
                              </p>
                            </div>
                          )}
                          {currentItem.category && (
                            <div>
                              <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">Catégorie</span>
                              <div className="mt-2">
                                <Badge className={`${getCategoryColor(currentItem.category)} text-sm font-bold px-3 py-1`}>
                                  {currentItem.category}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* FOOTER PREMIUM */}
                <div className="sticky bottom-0 z-50 border-t-3 border-gray-200 bg-white p-8 shadow-2xl">
                  <DialogFooter className="gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowDialog(false)}
                      className="h-16 px-10 text-lg font-bold border-3 border-gray-300 hover:bg-gray-100 rounded-2xl transition-all shadow-sm hover:shadow-md"
                    >
                      ❌ Annuler
                  </Button>
                  <Button 
                    onClick={handleSave}
                      className={`h-16 px-12 text-lg font-black rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 ${
                        editMode 
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' 
                          : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                      }`}
                    >
                      <Save className="h-6 w-6 mr-3" />
                      {editMode ? '💾 Enregistrer les modifications' : '✨ Créer le repas'}
                  </Button>
                </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}


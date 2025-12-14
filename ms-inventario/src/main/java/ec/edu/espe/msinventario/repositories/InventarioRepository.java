package ec.edu.espe.msinventario.repositories;

import ec.edu.espe.msinventario.models.entities.Inventario;
import ec.edu.espe.msinventario.models.entities.Sucursal;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface InventarioRepository extends CrudRepository<Inventario, Long> {
    // Para validar si ya existe el producto en esa sucursal
    Optional<Inventario> findBySucursalAndMedicamentoId(Sucursal sucursal, Long medicamentoId);
}

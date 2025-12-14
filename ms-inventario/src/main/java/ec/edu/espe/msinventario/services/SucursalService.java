package ec.edu.espe.msinventario.services;

import ec.edu.espe.msinventario.models.entities.Sucursal;
import java.util.List;
import java.util.Optional;

public interface SucursalService {
    List<Sucursal> listarTodos();
    Optional<Sucursal> buscarPorId(Long id);
    Sucursal guardar(Sucursal sucursal);
    void eliminar(Long id);
}